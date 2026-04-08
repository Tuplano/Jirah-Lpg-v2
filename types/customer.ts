import { LpgSize } from "./lpg-size";

export interface Customer {
  id: number;
  name: string;
  contact: string;
  address: string;
  created_at?: string;
}

export interface CustomerLpgPrice {
  id: number;
  customer_id: number;
  lpg_size_id: number;
  price: number;
  created_at: string;
  lpg_sizes?: LpgSize;
}
