"use server";

import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/types";

export async function getAllTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, lpg_sizes(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function recordManualAdjustment(data: {
  lpg_size_id: number;
  quantity: number; // Can be positive or negative
  target_column: 'full_count' | 'empty_count' | 'for_refill_count';
  note: string;
}) {
  const supabase = await createClient();

  // 1. Record Transaction
  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .insert({
      type: 'adjust',
      lpg_size_id: data.lpg_size_id,
      quantity: data.quantity,
      note: `[Adjust ${data.target_column}] ${data.note}`
    })
    .select()
    .single();

  if (txError) throw txError;

  // 2. Fetch current inventory stock for that size
  const { data: currentInv, error: fetchError } = await supabase
    .from("inventory")
    .select("*")
    .eq("lpg_size_id", data.lpg_size_id)
    .single();

  if (fetchError) throw fetchError;

  // 3. Update Inventory
  const newCount = Math.max(0, (currentInv[data.target_column] || 0) + data.quantity);
  
  const { error: invError } = await supabase
    .from("inventory")
    .update({
      [data.target_column]: newCount
    })
    .eq("lpg_size_id", data.lpg_size_id);

  if (invError) throw invError;

  return tx;
}

export async function getAllAdjustments(): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, lpg_sizes(*)")
    .eq("type", "adjust")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}


