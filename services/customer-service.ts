"use server";

import { createClient } from "@/lib/supabase/server";
import { Customer, CustomerLpgPrice } from "@/types";

export async function getAllCustomers(page: number = 1, pageSize: number = 10): Promise<{ data: Customer[], count: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("customers")
    .select("*", { count: 'exact' })
    .order("name", { ascending: true })
    .range(from, to);

  if (error) throw error;
  return {
    data: data || [],
    count: count || 0
  };
}

export async function createCustomer(data: Omit<Customer, 'id'>) {
  const supabase = await createClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // Log transaction
  await supabase
    .from("transactions")
    .insert({
      type: 'create',
      reference_table: 'customers',
      reference_id: customer.id,
      quantity: 0,
      note: `[CREATE] New Customer: ${data.name}`
    });

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

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
  const supabase = await createClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Log transaction
  await supabase
    .from("transactions")
    .insert({
      type: 'update',
      reference_table: 'customers',
      reference_id: id,
      quantity: 0,
      note: `[UPDATE] Customer #${id} (${customer.name}) updated.`
    });

  return customer;
}

export async function deleteCustomer(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;

  // Log transaction
  await supabase
    .from("transactions")
    .insert({
      type: 'delete',
      reference_table: 'customers',
      reference_id: id,
      quantity: 0,
    });
}

export async function deleteCustomerLpgPrice(customerId: number, lpgSizeId: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_lpg_prices")
    .delete()
    .eq("customer_id", customerId)
    .eq("lpg_size_id", lpgSizeId);

  if (error) throw error;
}
