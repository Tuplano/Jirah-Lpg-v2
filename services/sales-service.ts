"use server";

import { createClient } from "@/lib/supabase/server";
import { Sale, SaleItem, TransactionType } from "@/types";

export async function getAllSales(): Promise<Sale[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*, customers(*), sales_items(*, lpg_sizes(*))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function recordSale(data: {
  customer_id?: number | null;
  items: Array<{
    lpg_size_id: number;
    quantity: number;
    unit_price: number;
  }>;
  total_price: number;
  type: 'sale' | 'exchange';
  note?: string;
}) {
  const supabase = await createClient();

  // 1. Record the Sale header
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      customer_id: data.customer_id ?? null,
      total_price: data.total_price,
      type: data.type
    })
    .select()
    .single();

  if (saleError) throw saleError;

  // 2. Insert sales_items
  const itemsToInsert = data.items.map(item => ({
    sales_id: sale.id,
    lpg_size_id: item.lpg_size_id,
    quantity: item.quantity,
    unit_price: item.unit_price
  }));

  const { error: itemsError } = await supabase
    .from("sales_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  // 3. Update inventory for each item
  for (const item of data.items) {
    const { data: currentInv, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchError) throw fetchError;

    const updates: any = {
      full_count: Math.max(0, currentInv.full_count - item.quantity)
    };

    if (data.type === 'exchange') {
      updates.empty_count = currentInv.empty_count + item.quantity;
    }

    const { error: invError } = await supabase
      .from("inventory")
      .update(updates)
      .eq("lpg_size_id", item.lpg_size_id);

    if (invError) throw invError;

    // 4. Log transaction
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        type: 'sale',
        lpg_size_id: item.lpg_size_id,
        quantity: item.quantity,
        note: data.note || `Sale: ${data.type}${data.customer_id ? ` for customer ${data.customer_id}` : ""}`
      });

    if (txError) throw txError;
  }

  return sale;
}

export async function updateSale(id: number, data: {
  customer_id?: number | null;
  items: Array<{
    lpg_size_id: number;
    quantity: number;
    unit_price: number;
  }>;
  total_price: number;
  type: 'sale' | 'exchange';
  note?: string;
}) {
  const supabase = await createClient();

  // 1. Fetch original sale with items
  const { data: originalSale, error: fetchSaleError } = await supabase
    .from("sales")
    .select("*, sales_items(*)")
    .eq("id", id)
    .single();

  if (fetchSaleError) throw fetchSaleError;

  // 2. Reverse all original inventory changes
  for (const item of originalSale.sales_items || []) {
    const { data: currentInv, error: fetchInvError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchInvError) throw fetchInvError;

    const reverseUpdates: any = {
      full_count: currentInv.full_count + item.quantity
    };

    if (originalSale.type === 'exchange') {
      reverseUpdates.empty_count = Math.max(0, currentInv.empty_count - item.quantity);
    }

    const { error: reverseInvError } = await supabase
      .from("inventory")
      .update(reverseUpdates)
      .eq("lpg_size_id", item.lpg_size_id);

    if (reverseInvError) throw reverseInvError;
  }

  // 3. Delete old items
  const { error: deleteItemsError } = await supabase
    .from("sales_items")
    .delete()
    .eq("sales_id", id);

  if (deleteItemsError) throw deleteItemsError;

  // 4. Update sale header
  const { error: updateSaleError } = await supabase
    .from("sales")
    .update({
      customer_id: data.customer_id ?? null,
      total_price: data.total_price,
      type: data.type
    })
    .eq("id", id);

  if (updateSaleError) throw updateSaleError;

  // 5. Insert new items
  const itemsToInsert = data.items.map(item => ({
    sales_id: id,
    lpg_size_id: item.lpg_size_id,
    quantity: item.quantity,
    unit_price: item.unit_price
  }));

  const { error: itemsError } = await supabase
    .from("sales_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  // 6. Apply new inventory changes
  for (const item of data.items) {
    const { data: currentInv, error: fetchInvError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchInvError) throw fetchInvError;

    const updates: any = {
      full_count: Math.max(0, currentInv.full_count - item.quantity)
    };

    if (data.type === 'exchange') {
      updates.empty_count = currentInv.empty_count + item.quantity;
    }

    const { error: invError } = await supabase
      .from("inventory")
      .update(updates)
      .eq("lpg_size_id", item.lpg_size_id);

    if (invError) throw invError;
  }

  // 7. Log audit entry
  const { error: auditError } = await supabase
    .from("transactions")
    .insert({
      type: "adjust",
      lpg_size_id: null,
      quantity: 0,
      note: `[UPDATED] Sale #${id}: ${(originalSale.sales_items || []).length} → ${data.items.length} items | New Total: ₱${data.total_price.toLocaleString()}`
    });

  if (auditError) throw auditError;

  return { id, ...data };
}

export async function deleteSale(id: number) {
  const supabase = await createClient();

  // 1. Fetch sale with items
  const { data: sale, error: fetchSaleError } = await supabase
    .from("sales")
    .select("*, sales_items(*)")
    .eq("id", id)
    .single();

  if (fetchSaleError) throw fetchSaleError;

  // 2. Reverse inventory for all items
  for (const item of sale.sales_items || []) {
    const { data: currentInv, error: fetchInvError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", item.lpg_size_id)
      .single();

    if (fetchInvError) throw fetchInvError;

    const reverseUpdates: any = {
      full_count: currentInv.full_count + item.quantity
    };

    if (sale.type === 'exchange') {
      reverseUpdates.empty_count = Math.max(0, currentInv.empty_count - item.quantity);
    }

    const { error: invError } = await supabase
      .from("inventory")
      .update(reverseUpdates)
      .eq("lpg_size_id", item.lpg_size_id);

    if (invError) throw invError;
  }

  // 3. Log audit entry
  const { error: auditError } = await supabase
    .from("transactions")
    .insert({
      type: "adjust",
      lpg_size_id: null,
      quantity: 0,
      note: `[DELETED] Sale #${id}: ${(sale.sales_items || []).length} items | Original Total: ₱${sale.total_price.toLocaleString()}`
    });

  if (auditError) throw auditError;

  // 4. Delete the sale (cascades to sales_items)
  const { error: deleteSaleError } = await supabase
    .from("sales")
    .delete()
    .eq("id", id);

  if (deleteSaleError) throw deleteSaleError;

  return true;
}
