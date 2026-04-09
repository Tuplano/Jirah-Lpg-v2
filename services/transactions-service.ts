"use server";

import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/types";

export async function getAllTransactions(page: number = 1, pageSize: number = 10): Promise<{ data: Transaction[], count: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("transactions")
    .select("*, lpg_sizes(*, suppliers(*))", { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return {
    data: data || [],
    count: count || 0
  };
}

export async function recordManualAdjustment(data: {
  lpg_size_id: number;
  quantity: number; // Can be positive or negative
  target_column: 'full_count' | 'empty_count' | 'for_refill_count';
  note: string;
}) {
  const supabase = await createClient();

  // 1. Fetch current inventory stock for that size
  const { data: currentInv, error: fetchError } = await supabase
    .from("inventory")
    .select("*")
    .eq("lpg_size_id", data.lpg_size_id)
    .single();

  if (fetchError) throw fetchError;

  const oldQuantity = currentInv[data.target_column] || 0;
  const newCount = Math.max(0, oldQuantity + data.quantity);

  // 2. Record Transaction
  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .insert({
      type: 'adjust',
      reference_table: 'inventory',
      reference_id: currentInv.id,
      lpg_size_id: data.lpg_size_id,
      quantity: data.quantity,
      old_quantity: oldQuantity,
      new_quantity: newCount,
      note: `[Adjust ${data.target_column}] ${data.note}`
    })
    .select()
    .single();

  if (txError) throw txError;

  // 3. Update Inventory
  const { error: invError } = await supabase
    .from("inventory")
    .update({
      [data.target_column]: newCount
    })
    .eq("id", currentInv.id);

  if (invError) throw invError;

  return tx;
}

export async function getAllAdjustments(page: number = 1, pageSize: number = 10): Promise<{ data: Transaction[], count: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("transactions")
    .select("*, lpg_sizes(*, suppliers(*))", { count: 'exact' })
    .eq("type", "adjust")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return {
    data: data || [],
    count: count || 0
  };
}


