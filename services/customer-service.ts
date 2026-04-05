"use server";

import { createClient } from "@/lib/supabase/server";
import { Customer } from "@/types/inventory";

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
