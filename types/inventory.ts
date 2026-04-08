import { LpgSize } from "./lpg-size";

export interface Inventory {
  id: number;
  lpg_size_id: number;
  full_count: number;
  empty_count: number;
  for_refill_count: number;
  updated_at: string;
  lpg_sizes?: LpgSize; // Joined data
}


