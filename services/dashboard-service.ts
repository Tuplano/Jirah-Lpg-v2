"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  // 1. Total Sales Count & Value (Overall)
  const { data: salesData, error: salesError } = await supabase
    .from("sales")
    .select("total_price");

  if (salesError) throw salesError;

  const { data: salesItemsData, error: itemsError } = await supabase
    .from("sales_items")
    .select("quantity");

  if (itemsError) throw itemsError;

  const totalSalesQuantity = (salesItemsData || []).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
  const totalSalesRevenue = (salesData || []).reduce((acc: number, curr: any) => acc + Number(curr.total_price), 0);

  // 2. Inventory Stats (Full Counts)
  const { data: invData, error: invError } = await supabase
    .from("inventory")
    .select("full_count, empty_count, for_refill_count");

  if (invError) throw invError;

  const totalFull = (invData || []).reduce((acc: number, curr: any) => acc + curr.full_count, 0);
  const totalEmpty = (invData || []).reduce((acc: number, curr: any) => acc + curr.empty_count, 0);
  const totalRefill = (invData || []).reduce((acc: number, curr: any) => acc + curr.for_refill_count, 0);

  // 3. Today's Sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todaySalesData, error: todayError } = await supabase
    .from("sales")
    .select("id, total_price")
    .gte("created_at", today.toISOString());

  if (todayError) throw todayError;

  const { data: todayItemsData, error: todayItemsError } = await supabase
    .from("sales_items")
    .select("sales_id, quantity")
    .gte("created_at", today.toISOString());

  if (todayItemsError) throw todayItemsError;

  // Get today's sales IDs
  const todaySalesIds = (todaySalesData || []).map((s: any) => s.id);
  const todayItems = (todayItemsData || []).filter((item: any) => todaySalesIds.includes(item.sales_id));

  const todaySalesCount = todayItems.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
  const todayRevenue = (todaySalesData || []).reduce((acc: number, curr: any) => acc + Number(curr.total_price), 0);

  // 4. Costs (Refills & Deliveries) for Profit Calculation
  const { data: refillData } = await supabase.from("refill_batches").select("cost, created_at");
  const { data: deliveryData } = await supabase.from("supplier_deliveries").select("total_cost, created_at");

  const totalRefillCost = (refillData || []).reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
  const totalDeliveryCost = (deliveryData || []).reduce((acc, curr) => acc + Number(curr.total_cost || 0), 0);
  
  const todayRefillCost = (refillData || [])
    .filter(r => new Date(r.created_at) >= today)
    .reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
    
  const todayDeliveryCost = (deliveryData || [])
    .filter(d => new Date(d.created_at) >= today)
    .reduce((acc, curr) => acc + Number(curr.total_cost || 0), 0);

  const totalSalesCost = totalRefillCost + totalDeliveryCost;
  const todaySalesCost = todayRefillCost + todayDeliveryCost;

  return {
    totalSalesQuantity,
    totalSalesRevenue,
    totalFull,
    totalEmpty,
    totalRefill,
    todaySalesCount,
    todayRevenue,
    totalProfit: totalSalesRevenue - totalSalesCost,
    todayProfit: todayRevenue - todaySalesCost
  };
}

