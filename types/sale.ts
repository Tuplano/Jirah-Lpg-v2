import { LpgSize } from "./lpg-size";
import { Customer } from "./customer";

export type SaleType = 'sale' | 'exchange';

export interface SaleItem {
  id: number;
  sales_id: number;
  lpg_size_id: number;
  quantity: number;
  unit_price: number;
  created_at: string;
  lpg_sizes?: LpgSize;
}

export interface Sale {
  id: number;
  customer_id?: number | null;
  total_price: number;
  type: SaleType;
  created_at: string;
  customers?: Customer | null;
  sales_items?: SaleItem[];
}
