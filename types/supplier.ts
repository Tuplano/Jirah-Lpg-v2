import { LpgSize } from "./lpg-size";

export interface Supplier {
  id: number;
  name: string;
  contact?: string | null;
  address?: string | null;
  created_at: string;
}

export interface SupplierDelivery {
  id: number;
  supplier_id: number;
  delivery_date: string;
  type: 'exchange' | 'purchase';
  delivery_fee: number;
  total_cost: number;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string | null;
  created_at: string;
  suppliers?: Supplier;
}

export interface SupplierDeliveryItem {
  id: number;
  supplier_delivery_id: number;
  lpg_size_id: number;
  quantity: number;
  unit_price: number;
  created_at: string;
  lpg_sizes?: LpgSize;
}
