"use server";

import { createClient } from "@/lib/supabase/server";
import { Refill, TransactionType } from "@/types/inventory";

export async function getAllRefills(): Promise<Refill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("refills")
    .select("*, lpg_sizes(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function recordSent(data: {
  lpg_size_id: number;
  quantity: number;
  cost?: number;
  date_sent: string;
  note?: string;
}) {
  const supabase = await createClient();

  // 1. Record the Refill
  const { data: refill, error: refillError } = await supabase
    .from("refills")
    .insert({
      lpg_size_id: data.lpg_size_id,
      quantity: data.quantity,
      cost: data.cost,
      date_sent: data.date_sent,
      status: 'pending'
    })
    .select()
    .single();

  if (refillError) throw refillError;

  // 2. Add to Transactions log
  const { error: txError } = await supabase
    .from("transactions")
    .insert({
      type: 'refill_send',
      lpg_size_id: data.lpg_size_id,
      quantity: data.quantity,
      note: data.note || `Sent for Refill: ${data.quantity} units`
    });

  if (txError) throw txError;

  // 3. Update Inventory
  const { data: currentInv, error: fetchError } = await supabase
    .from("inventory")
    .select("*")
    .eq("lpg_size_id", data.lpg_size_id)
    .single();

  if (fetchError) throw fetchError;

  const updates = {
    empty_count: Math.max(0, currentInv.empty_count - data.quantity),
    for_refill_count: currentInv.for_refill_count + data.quantity
  };

  const { error: invError } = await supabase
    .from("inventory")
    .update(updates)
    .eq("lpg_size_id", data.lpg_size_id);

  if (invError) throw invError;

  return refill;
}

export async function recordReturned(id: number, dateReturned: string, cost?: number) {
  const supabase = await createClient();

  // 1. Get Refill details
  const { data: refill, error: fetchRefillError } = await supabase
    .from("refills")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchRefillError) throw fetchRefillError;
  if (refill.status === 'completed') throw new Error("Refill already completed");

  // 2. Update Refill record
  const { error: updateRefillError } = await supabase
    .from("refills")
    .update({
      status: 'completed',
      date_returned: dateReturned,
      cost: cost ?? refill.cost
    })
    .eq("id", id);

  if (updateRefillError) throw updateRefillError;

  // 3. Add to Transactions log
  const { error: txError } = await supabase
    .from("transactions")
    .insert({
      type: 'refill_return',
      lpg_size_id: refill.lpg_size_id,
      quantity: refill.quantity,
      note: `Returned from Refill: ${refill.quantity} units`
    });

  if (txError) throw txError;

  // 4. Update Inventory
  const { data: currentInv, error: fetchInvError } = await supabase
    .from("inventory")
    .select("*")
    .eq("lpg_size_id", refill.lpg_size_id)
    .single();

  if (fetchInvError) throw fetchInvError;

  const updates = {
    for_refill_count: Math.max(0, currentInv.for_refill_count - refill.quantity),
    full_count: currentInv.full_count + refill.quantity
  };

  const { error: invError } = await supabase
    .from("inventory")
    .update(updates)
    .eq("lpg_size_id", refill.lpg_size_id);

  if (invError) throw invError;

  return true;
}

