"use server";

import { createClient } from "@/lib/supabase/server";
import { Inventory } from "@/types/inventory";

export async function getStockLevels(): Promise<Inventory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("*, lpg_sizes(*)")
    .order("lpg_size_id", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateStock(lpgSizeId: number, updates: Partial<Pick<Inventory, 'full_count' | 'empty_count' | 'for_refill_count'>>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory")
    .update(updates)
    .eq("lpg_size_id", lpgSizeId);

  if (error) throw error;
}

