import { createClient } from "@/lib/supabase/server";
import { Sale, TransactionType } from "@/types/inventory";

export const salesService = {
  async getAll(): Promise<Sale[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sales")
      .select("*, lpg_sizes(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async recordSale(data: {
    lpg_size_id: number;
    quantity: number;
    total_price: number;
    type: 'sale' | 'exchange';
    note?: string;
  }) {
    const supabase = await createClient();

    // 1. Record the Sale
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        lpg_size_id: data.lpg_size_id,
        quantity: data.quantity,
        total_price: data.total_price,
        type: data.type
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Add to Transactions log
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        type: 'sale',
        lpg_size_id: data.lpg_size_id,
        quantity: data.quantity,
        note: data.note || `Sale: ${data.type}`
      });

    if (txError) throw txError;

    // 3. Update Inventory (Atomic if possible, but sequential for now)
    // Decrement full_count
    // If exchange, increment empty_count
    
    // Fetch current inventory
    const { data: currentInv, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("lpg_size_id", data.lpg_size_id)
      .single();

    if (fetchError) throw fetchError;

    const updates: any = {
      full_count: Math.max(0, currentInv.full_count - data.quantity)
    };

    if (data.type === 'exchange') {
      updates.empty_count = currentInv.empty_count + data.quantity;
    }

    const { error: invError } = await supabase
      .from("inventory")
      .update(updates)
      .eq("lpg_size_id", data.lpg_size_id);

    if (invError) throw invError;

    return sale;
  }
};
