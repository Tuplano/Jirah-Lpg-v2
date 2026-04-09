import { LpgSize } from "./lpg-size";

export type TransactionType = 'sale' | 'refill_send' | 'refill_return' | 'return' | 'adjust' | 'delete' | 'create' | 'update';

export interface Transaction {
  id: number;
  type: TransactionType;
  reference_table: string | null;
  reference_id: number | null;
  lpg_size_id: number | null;
  refill_batch_id?: number | null;
  quantity: number;
  old_quantity: number | null;
  new_quantity: number | null;
  user_id: number | null;
  note: string | null;
  created_at: string;
  lpg_sizes?: LpgSize; // Joined data
}
