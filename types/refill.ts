import { LpgSize } from "./lpg-size";

export type RefillStatus = 'pending' | 'completed';

export interface RefillSendItem {
  lpg_size_id: number;
  quantity: number;
  price_per_kilo: number;
}

export interface RefillBatchItem {
  id: number;
  refill_batch_id: number;
  lpg_size_id: number;
  quantity: number;
  price_per_kilo: number;
  created_at: string;
  lpg_sizes?: LpgSize;
}

export interface RefillBatch {
  id: number;
  cost: number | null;
  date_sent: string;
  date_returned: string | null;
  status: RefillStatus;
  note: string | null;
  created_at: string;
  refill_batch_items?: RefillBatchItem[];
}

export interface RefillProductSummary {
  id: string;
  names: string[];
  total_quantity: number;
  cost: number | null;
  date_sent: string;
  date_returned: string | null;
  status: RefillStatus;
  created_at: string;
  note: string | null;
  items: RefillBatchItem[];
}
