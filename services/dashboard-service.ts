"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  // 1. Total Sales Count & Value (Overall)
  const { data: salesData, error: salesError } = await supabase
    .from("sales")
    .select("quantity, total_price");

  if (salesError) throw salesError;

  const totalSalesQuantity = salesData.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalSalesRevenue = salesData.reduce((acc, curr) => acc + Number(curr.total_price), 0);

  // 2. Inventory Stats (Full Counts)
  const { data: invData, error: invError } = await supabase
    .from("inventory")
    .select("full_count, empty_count, for_refill_count");

  if (invError) throw invError;

  const totalFull = invData.reduce((acc, curr) => acc + curr.full_count, 0);
  const totalEmpty = invData.reduce((acc, curr) => acc + curr.empty_count, 0);
  const totalRefill = invData.reduce((acc, curr) => acc + curr.for_refill_count, 0);

  // 3. Today's Sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todaySales, error: todayError } = await supabase
    .from("sales")
    .select("quantity, total_price")
    .gte("created_at", today.toISOString());

  if (todayError) throw todayError;

  const todaySalesCount = todaySales.reduce((acc, curr) => acc + curr.quantity, 0);
  const todayRevenue = todaySales.reduce((acc, curr) => acc + Number(curr.total_price), 0);

  return {
    totalSalesQuantity,
    totalSalesRevenue,
    totalFull,
    totalEmpty,
    totalRefill,
    todaySalesCount,
    todayRevenue
  };
}

