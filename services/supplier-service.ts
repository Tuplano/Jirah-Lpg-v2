"use server";

import { createClient } from "@/lib/supabase/server";
import { Supplier, SupplierDelivery } from "@/types";

export async function getAllSuppliers(): Promise<Supplier[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSupplier(data: Omit<Supplier, 'id' | 'created_at'>) {
  const supabase = await createClient();
  const { data: supplier, error } = await supabase
    .from("suppliers")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // Log transaction
  await supabase
    .from("transactions")
    .insert({
      type: 'create',
      reference_table: 'suppliers',
      reference_id: supplier.id,
      quantity: 0,
      note: `[CREATE] New Supplier: ${data.name}`
    });

  return supplier;
}

export async function updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier> {
  const supabase = await createClient();
  const { data: supplier, error } = await supabase
    .from("suppliers")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("transactions")
    .insert({
      type: 'update',
      reference_table: 'suppliers',
      reference_id: id,
      quantity: 0,
      note: `[UPDATE] Supplier #${id} (${supplier.name}) updated.`
    });

  return supplier;
}

export async function deleteSupplier(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", id);

  if (error) throw error;

  await supabase
    .from("transactions")
    .insert({
      type: 'delete',
      reference_table: 'suppliers',
      reference_id: id,
      quantity: 0,
      note: `[DELETE] Supplier #${id} removed.`
    });
}

// ==========================================
// SUPPLIER DELIVERIES
// ==========================================

export async function getAllSupplierDeliveries(page: number = 1, pageSize: number = 10): Promise<{ data: SupplierDelivery[], count: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("supplier_deliveries")
    .select("*, suppliers(*), supplier_delivery_items(*, lpg_sizes(*))", { count: 'exact' })
    .order("delivery_date", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return {
    data: data || [],
    count: count || 0
  };
}

export async function recordSupplierDelivery(data: {
  supplier_id: number;
  delivery_date: string;
  type: 'exchange' | 'purchase';
  delivery_fee: number;
  total_cost: number;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  items: Array<{
    lpg_size_id: number;
    quantity: number;
    unit_price: number;
  }>;
}) {
  const supabase = await createClient();

  // 1. Record Header
  const { data: delivery, error: deliveryError } = await supabase
    .from("supplier_deliveries")
    .insert({
      supplier_id: data.supplier_id,
      delivery_date: data.delivery_date,
      type: data.type,
      delivery_fee: data.delivery_fee,
      total_cost: data.total_cost,
      status: data.status,
      note: data.note,
    })
    .select()
    .single();

  if (deliveryError) throw deliveryError;

  // 2. Insert Items
  const itemsToInsert = data.items.map(item => ({
    supplier_delivery_id: delivery.id,
    lpg_size_id: item.lpg_size_id,
    quantity: item.quantity,
    unit_price: item.unit_price
  }));

  const { error: itemsError } = await supabase
    .from("supplier_delivery_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  // 3. Update inventory if completed
  if (data.status === 'completed') {
    for (const item of data.items) {
      const { data: currentInv, error: fetchError } = await supabase
        .from("inventory")
        .select("*")
        .eq("lpg_size_id", item.lpg_size_id)
        .single();
      if (fetchError) throw fetchError;

      const updates: any = {
        full_count: currentInv.full_count + item.quantity
      };

      if (data.type === 'exchange') {
        updates.empty_count = Math.max(0, currentInv.empty_count - item.quantity);
      }

      const { error: invError } = await supabase
        .from("inventory")
        .update(updates)
        .eq("lpg_size_id", item.lpg_size_id);
      if (invError) throw invError;

      // 4. Log transaction
      const { error: txError } = await supabase
        .from("transactions")
        .insert({
          type: 'supplier_delivery',
          reference_table: 'supplier_deliveries',
          reference_id: delivery.id,
          lpg_size_id: item.lpg_size_id,
          quantity: item.quantity,
          old_quantity: currentInv.full_count,
          new_quantity: updates.full_count,
          note: `Supplier Delivery: ${data.type} (Supplier #${data.supplier_id})`
        });
      if (txError) throw txError;
    }
  }

  return delivery;
}

export async function updateSupplierDeliveryStatus(id: number, status: 'pending' | 'completed' | 'cancelled') {
  const supabase = await createClient();

  const { data: delivery, error: fetchError } = await supabase
    .from("supplier_deliveries")
    .select("*, supplier_delivery_items(*)")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;
  if (delivery.status === status) return delivery;

  // Only handle transitioning TO completed (basic support).
  // If we wanted to handle completed -> cancelled, we would reverse inventory.
  if (status === 'completed' && delivery.status !== 'completed') {
    for (const item of delivery.supplier_delivery_items || []) {
      const { data: currentInv, error: invFetchError } = await supabase
        .from("inventory")
        .select("*")
        .eq("lpg_size_id", item.lpg_size_id)
        .single();
      
      if (invFetchError) throw invFetchError;

      const updates: any = {
        full_count: currentInv.full_count + item.quantity
      };
      if (delivery.type === 'exchange') {
        updates.empty_count = Math.max(0, currentInv.empty_count - item.quantity);
      }

      await supabase.from("inventory").update(updates).eq("lpg_size_id", item.lpg_size_id);

      await supabase.from("transactions").insert({
        type: 'supplier_delivery',
        reference_table: 'supplier_deliveries',
        reference_id: delivery.id,
        lpg_size_id: item.lpg_size_id,
        quantity: item.quantity,
        old_quantity: currentInv.full_count,
        new_quantity: updates.full_count,
        note: `Supplier Delivery Completed: ${delivery.type}`
      });
    }
  } else if (delivery.status === 'completed' && (status === 'cancelled' || status === 'pending')) {
    // Reverse inventory
    for (const item of delivery.supplier_delivery_items || []) {
      const { data: currentInv, error: invFetchError } = await supabase
        .from("inventory")
        .select("*")
        .eq("lpg_size_id", item.lpg_size_id)
        .single();
      
      if (invFetchError) throw invFetchError;

      const updates: any = {
        full_count: Math.max(0, currentInv.full_count - item.quantity)
      };
      if (delivery.type === 'exchange') {
        updates.empty_count = currentInv.empty_count + item.quantity;
      }

      await supabase.from("inventory").update(updates).eq("lpg_size_id", item.lpg_size_id);

      await supabase.from("transactions").insert({
        type: 'supplier_delivery',
        reference_table: 'supplier_deliveries',
        reference_id: delivery.id,
        lpg_size_id: item.lpg_size_id,
        quantity: -item.quantity,
        old_quantity: currentInv.full_count,
        new_quantity: updates.full_count,
        note: `Supplier Delivery ${status === 'cancelled' ? 'Cancelled' : 'Reverted to Pending'}`
      });
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("supplier_deliveries")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw updateError;
  return updated;
}

export async function deleteSupplierDelivery(id: number) {
  const supabase = await createClient();

  // Cancel it first if it was completed, to reverse inventory safely.
  await updateSupplierDeliveryStatus(id, 'cancelled');

  const { error } = await supabase
    .from("supplier_deliveries")
    .delete()
    .eq("id", id);

  if (error) throw error;

  await supabase
    .from("transactions")
    .insert({
      type: "delete",
      reference_table: 'supplier_deliveries',
      reference_id: id,
      quantity: 0,
      note: `[DELETED] Supplier Delivery #${id}`
    });

  return true;
}
