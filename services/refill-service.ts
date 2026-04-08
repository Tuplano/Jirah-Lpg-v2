"use server";

import { createClient } from "@/lib/supabase/server";
import { RefillBatch, RefillBatchItem, RefillSendItem } from "@/types/inventory";

export async function getAllRefills(): Promise<RefillBatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("refill_batches")
    .select("*, refill_batch_items(*, lpg_sizes(*))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as RefillBatch[];
}

export async function recordSentBatch(data: {
  items: RefillSendItem[];
  date_sent: string;
  note?: string;
}) {
  if (!data.items.length) {
    throw new Error("At least one refill product is required.");
  }
  const supabase = await createClient();
  const { data: lpgSizes, error: lpgSizesError } = await supabase
    .from("lpg_sizes")
    .select("id, size")
    .in("id", data.items.map((item) => item.lpg_size_id));

  if (lpgSizesError) throw lpgSizesError;

  const lpgSizeMap = new Map((lpgSizes || []).map((size) => [size.id, Number(size.size)]));
  const computedCost = data.items.reduce((total, item) => {
    const tankSize = lpgSizeMap.get(item.lpg_size_id);

    if (tankSize === undefined) {
      throw new Error(`Missing LPG size for refill item ${item.lpg_size_id}.`);
    }

    return total + item.price_per_kilo * tankSize * item.quantity;
  }, 0);

  const { data: batch, error: batchError } = await supabase
    .from("refill_batches")
    .insert({
      cost: Number(computedCost.toFixed(2)),
      date_sent: data.date_sent,
      status: "pending",
      note: data.note,
    })
    .select()
    .single();

  if (batchError) throw batchError;

  const batchItems = data.items.map((item) => ({
    refill_batch_id: batch.id,
    lpg_size_id: item.lpg_size_id,
    quantity: item.quantity,
    price_per_kilo: item.price_per_kilo,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("refill_batch_items")
    .insert(batchItems)
    .select();

  if (itemsError) throw itemsError;

  for (const item of data.items) {
    const { data: currentInv, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchError) throw fetchError;
    if (item.quantity > currentInv.empty_count) {
      throw new Error(
        `Cannot send ${item.quantity} units for LPG size ${item.lpg_size_id}. Only ${currentInv.empty_count} empty tanks are available.`
      );
    }

    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        type: "refill_send",
        lpg_size_id: item.lpg_size_id,
        refill_batch_id: batch.id,
        quantity: item.quantity,
        note: data.note || `Sent for Refill: ${item.quantity} units`,
      });

    if (txError) throw txError;
    const { error: invError } = await supabase
      .from("inventory")
      .update({
        empty_count: Math.max(0, currentInv.empty_count - item.quantity),
        for_refill_count: currentInv.for_refill_count + item.quantity,
      })
      .eq("lpg_size_id", item.lpg_size_id);

    if (invError) throw invError;
  }

  const refillBatch: RefillBatch = {
    ...batch,
    refill_batch_items: (items || []) as RefillBatchItem[],
  };

  return refillBatch;
}

export async function recordReturned(id: number, dateReturned: string) {
  const supabase = await createClient();

  const { data: batch, error: fetchBatchError } = await supabase
    .from("refill_batches")
    .select("*, refill_batch_items(*)")
    .eq("id", id)
    .single();

  if (fetchBatchError) throw fetchBatchError;
  if (batch.status === "completed") throw new Error("Refill batch already completed");

  const { error: updateBatchError } = await supabase
    .from("refill_batches")
    .update({
      status: "completed",
      date_returned: dateReturned,
      cost: batch.cost
    })
    .eq("id", id);

  if (updateBatchError) throw updateBatchError;

  for (const item of batch.refill_batch_items || []) {
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        type: "refill_return",
        lpg_size_id: item.lpg_size_id,
        refill_batch_id: batch.id,
        quantity: item.quantity,
        note: `Returned from Refill: ${item.quantity} units`,
      });

    if (txError) throw txError;

    const { data: currentInv, error: fetchInvError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchInvError) throw fetchInvError;

    const { error: invError } = await supabase
      .from("inventory")
      .update({
        for_refill_count: Math.max(0, currentInv.for_refill_count - item.quantity),
        full_count: currentInv.full_count + item.quantity,
      })
      .eq("lpg_size_id", item.lpg_size_id);

    if (invError) throw invError;
  }

  return true;
}

export async function deleteRefill(id: number) {
  const supabase = await createClient();

  const { data: batch, error: fetchBatchError } = await supabase
    .from("refill_batches")
    .select("*, refill_batch_items(*)")
    .eq("id", id)
    .single();

  if (fetchBatchError) throw fetchBatchError;
  if (batch.status === "completed") throw new Error("Cannot delete completed refill batch");

  // Log audit entry for delete
  const itemsInfo = (batch.refill_batch_items || []).map((item: any) => `${item.quantity}x LPG#${item.lpg_size_id}`).join(", ");
  const { error: auditError } = await supabase
    .from("transactions")
    .insert({
      type: "adjust",
      refill_batch_id: id,
      quantity: 0,
      note: `[DELETED] Refill Batch #${id}: ${itemsInfo} | Cost: ₱${batch.cost.toLocaleString()}`
    });

  if (auditError) throw auditError;

  if (auditError) throw auditError;

  // Reverse the inventory changes made when sending for refill
  for (const item of batch.refill_batch_items || []) {
    const { data: currentInv, error: fetchInvError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchInvError) throw fetchInvError;

    const { error: invError } = await supabase
      .from("inventory")
      .update({
        empty_count: currentInv.empty_count + item.quantity,
        for_refill_count: Math.max(0, currentInv.for_refill_count - item.quantity),
      })
      .eq("lpg_size_id", item.lpg_size_id);

    if (invError) throw invError;
  }

  // Delete transactions
  const { error: txDeleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("refill_batch_id", id);

  if (txDeleteError) throw txDeleteError;

  // Delete batch items
  const { error: itemsDeleteError } = await supabase
    .from("refill_batch_items")
    .delete()
    .eq("refill_batch_id", id);

  if (itemsDeleteError) throw itemsDeleteError;

  // Delete batch
  const { error: batchDeleteError } = await supabase
    .from("refill_batches")
    .delete()
    .eq("id", id);

  if (batchDeleteError) throw batchDeleteError;

  return true;
}

export async function updateRefill(id: number, data: {
  items: RefillSendItem[];
  date_sent: string;
  note?: string;
}) {
  if (!data.items.length) {
    throw new Error("At least one refill product is required.");
  }
  const supabase = await createClient();

  const { data: existingBatch, error: fetchBatchError } = await supabase
    .from("refill_batches")
    .select("*, refill_batch_items(*)")
    .eq("id", id)
    .single();

  if (fetchBatchError) throw fetchBatchError;
  if (existingBatch.status === "completed") throw new Error("Cannot update completed refill batch");

  const { data: lpgSizes, error: lpgSizesError } = await supabase
    .from("lpg_sizes")
    .select("id, size")
    .in("id", data.items.map((item) => item.lpg_size_id));

  if (lpgSizesError) throw lpgSizesError;

  const lpgSizeMap = new Map((lpgSizes || []).map((size) => [size.id, Number(size.size)]));
  const computedCost = data.items.reduce((total, item) => {
    const tankSize = lpgSizeMap.get(item.lpg_size_id);

    if (tankSize === undefined) {
      throw new Error(`Missing LPG size for refill item ${item.lpg_size_id}.`);
    }

    return total + item.price_per_kilo * tankSize * item.quantity;
  }, 0);

  // Reverse old inventory changes
  for (const item of existingBatch.refill_batch_items || []) {
    const { data: currentInv, error: fetchInvError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchInvError) throw fetchInvError;

    const { error: invError } = await supabase
      .from("inventory")
      .update({
        empty_count: currentInv.empty_count + item.quantity,
        for_refill_count: Math.max(0, currentInv.for_refill_count - item.quantity),
      })
      .eq("lpg_size_id", item.lpg_size_id);

    if (invError) throw invError;
  }

  // Update batch
  const { error: batchError } = await supabase
    .from("refill_batches")
    .update({
      cost: Number(computedCost.toFixed(2)),
      date_sent: data.date_sent,
      note: data.note,
    })
    .eq("id", id);

  if (batchError) throw batchError;

  // Log audit entry for edit
  const itemsInfo = data.items.map((item) => `${item.quantity}x LPG#${item.lpg_size_id}`).join(", ");
  const { error: auditError } = await supabase
    .from("transactions")
    .insert({
      type: "adjust",
      refill_batch_id: id,
      quantity: 0,
      note: `[UPDATED] Refill Batch #${id}: ${itemsInfo} | New Cost: ₱${computedCost.toFixed(2)}`
    });

  if (auditError) throw auditError;

  // Delete old batch items
  const { error: itemsDeleteError } = await supabase
    .from("refill_batch_items")
    .delete()
    .eq("refill_batch_id", id);

  if (itemsDeleteError) throw itemsDeleteError;

  // Insert new batch items
  const batchItems = data.items.map((item) => ({
    refill_batch_id: id,
    lpg_size_id: item.lpg_size_id,
    quantity: item.quantity,
    price_per_kilo: item.price_per_kilo,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("refill_batch_items")
    .insert(batchItems)
    .select();

  if (itemsError) throw itemsError;

  // Apply new inventory changes
  for (const item of data.items) {
    const { data: currentInv, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchError) throw fetchError;
    if (item.quantity > currentInv.empty_count) {
      throw new Error(
        `Cannot update ${item.quantity} units for LPG size ${item.lpg_size_id}. Only ${currentInv.empty_count} empty tanks are available.`
      );
    }

    const { error: invError } = await supabase
      .from("inventory")
      .update({
        empty_count: Math.max(0, currentInv.empty_count - item.quantity),
        for_refill_count: currentInv.for_refill_count + item.quantity,
      })
      .eq("lpg_size_id", item.lpg_size_id);

    if (invError) throw invError;
  }

  const refillBatch: RefillBatch = {
    ...existingBatch,
    cost: Number(computedCost.toFixed(2)),
    date_sent: data.date_sent,
    note: data.note,
    refill_batch_items: (items || []) as RefillBatchItem[],
  };

  return refillBatch;
}
