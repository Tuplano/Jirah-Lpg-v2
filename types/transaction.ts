import { LpgSize } from "./lpg-size";

export type TransactionType = 'sale' | 'refill_send' | 'refill_return' | 'return' | 'adjust';

export interface Transaction {
  id: number;
  type: TransactionType;
  lpg_size_id: number | null;
  refill_batch_id?: number | null;
  quantity: number;
  note: string | null;
  created_at: string;
  lpg_sizes?: LpgSize; // Joined data
}
