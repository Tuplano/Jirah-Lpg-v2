"use server";

import { createClient } from "@/lib/supabase/server";
import { LpgSize } from "@/types/inventory";

export async function getAllLpgSizes(): Promise<LpgSize[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lpg_sizes")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createLpgSize(name: string, price: number): Promise<LpgSize> {
  const supabase = await createClient();
  
  // 1. Create the LPG Size
  const { data: size, error: sizeError } = await supabase
    .from("lpg_sizes")
    .insert({ name, price })
    .select()
    .single();

  if (sizeError) throw sizeError;

  // 2. Automatically initialize the inventory record for this size
  const { error: invError } = await supabase
    .from("inventory")
    .insert({ lpg_size_id: size.id, full_count: 0, empty_count: 0, for_refill_count: 0 });

  if (invError) throw invError;

  return size;
}

export async function updateLpgSize(id: number, updates: Partial<LpgSize>): Promise<LpgSize> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lpg_sizes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
