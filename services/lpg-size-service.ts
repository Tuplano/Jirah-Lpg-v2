"use server";

import { createClient } from "@/lib/supabase/server";
import { LpgSize } from "@/types/inventory";

function normalizeLpgSizeName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");

  if (/^\d+(\.\d+)?$/u.test(trimmed)) {
    return `${trimmed}kg`;
  }

  return trimmed.replace(/^(\d+(?:\.\d+)?)\s*(kg|kilos?)\b/iu, (_, value) => `${value}kg`);
}

export async function getAllLpgSizes(): Promise<LpgSize[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lpg_sizes")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createLpgSize(name: string, price: number, size: number): Promise<LpgSize> {
  const supabase = await createClient();
  const normalizedName = normalizeLpgSizeName(name);
  
  // 1. Create the LPG Size (No inventory initialization here anymore)
  const { data: createdSize, error: sizeError } = await supabase
    .from("lpg_sizes")
    .insert({ name: normalizedName, price, size })
    .select()
    .single();

  if (sizeError) throw sizeError;

  return createdSize;
}

export async function initializeInventory(
  lpgSizeId: number, 
  initialFull: number = 0, 
  initialEmpty: number = 0
): Promise<void> {
  const supabase = await createClient();
  
  const { error: invError } = await supabase
    .from("inventory")
    .insert({ 
      lpg_size_id: lpgSizeId, 
      full_count: initialFull, 
      empty_count: initialEmpty, 
      for_refill_count: 0 
    });

  if (invError) throw invError;
}

export async function getUnmanagedSizes(): Promise<LpgSize[]> {
  const supabase = await createClient();
  
  // Get all sizes
  const { data: allSizes, error: sizesError } = await supabase
    .from("lpg_sizes")
    .select("*");
    
  if (sizesError) throw sizesError;
  
  // Get managed size IDs
  const { data: managed, error: managedError } = await supabase
    .from("inventory")
    .select("lpg_size_id");
    
  if (managedError) throw managedError;
  
  const managedIds = new Set(managed.map(m => m.lpg_size_id));
  
  // Filter for unmanaged sizes
  return (allSizes || []).filter(size => !managedIds.has(size.id));
}

export async function updateLpgSize(id: number, updates: Partial<LpgSize>): Promise<LpgSize> {
  const supabase = await createClient();
  const normalizedUpdates = {
    ...updates,
    name: updates.name ? normalizeLpgSizeName(updates.name) : updates.name,
  };

  const { data, error } = await supabase
    .from("lpg_sizes")
    .update(normalizedUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
