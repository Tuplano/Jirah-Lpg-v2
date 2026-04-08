"use server";

import { createClient } from "@/lib/supabase/server";
import { Customer, CustomerLpgPrice } from "@/types";

export async function getAllCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCustomer(data: Omit<Customer, 'id'>) {
  const supabase = await createClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return customer;
}

export async function getCustomerLpgPrice(customerId: number, lpgSizeId: number): Promise<CustomerLpgPrice | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_lpg_prices")
    .select("*")
    .eq("customer_id", customerId)
    .eq("lpg_size_id", lpgSizeId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllCustomerLpgPrices(): Promise<CustomerLpgPrice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_lpg_prices")
    .select("*, lpg_sizes(*)")
    .order("customer_id", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertCustomerLpgPrice(data: {
  customer_id: number;
  lpg_size_id: number;
  price: number;
}): Promise<CustomerLpgPrice> {
  const supabase = await createClient();
  const { data: priceRow, error } = await supabase
    .from("customer_lpg_prices")
    .upsert(data, { onConflict: "customer_id,lpg_size_id" })
    .select("*, lpg_sizes(*)")
    .single();

  if (error) throw error;
  return priceRow;
}
