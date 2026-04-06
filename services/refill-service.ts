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
  cost?: number;
  date_sent: string;
  note?: string;
}) {
  if (!data.items.length) {
    throw new Error("At least one refill product is required.");
  }
  const supabase = await createClient();

  const { data: batch, error: batchError } = await supabase
    .from("refill_batches")
    .insert({
      cost: data.cost,
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
  }));

  const { data: items, error: itemsError } = await supabase
    .from("refill_batch_items")
    .insert(batchItems)
    .select();

  if (itemsError) throw itemsError;

  for (const item of data.items) {
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

    const { data: currentInv, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchError) throw fetchError;

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

export async function recordReturned(id: number, dateReturned: string, cost?: number) {
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
      cost: cost ?? batch.cost
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
