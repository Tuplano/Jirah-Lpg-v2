export interface LpgSize {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  contact: string;
  address: string;
}

export interface Inventory {
  id: number;
  lpg_size_id: number;
  full_count: number;
  empty_count: number;
  for_refill_count: number;
  updated_at: string;
  lpg_sizes?: LpgSize; // Joined data
}

export type RefillStatus = 'pending' | 'completed';

export interface Refill {
  id: number;
  lpg_size_id: number;
  quantity: number;
  cost: number | null;
  date_sent: string;
  date_returned: string | null;
  status: RefillStatus;
  created_at: string;
  lpg_sizes?: LpgSize; // Joined data
}

export type SaleType = 'sale' | 'exchange';

export interface Sale {
  id: number;
  lpg_size_id: number;
  quantity: number;
  total_price: number;
  type: SaleType;
  created_at: string;
  lpg_sizes?: LpgSize; // Joined data
}

export type TransactionType = 'sale' | 'refill_send' | 'refill_return' | 'return' | 'adjust';

export interface Transaction {
  id: number;
  type: TransactionType;
  lpg_size_id: number;
  quantity: number;
  note: string | null;
  created_at: string;
  lpg_sizes?: LpgSize; // Joined data
}

// Legacy types (keeping these if needed by components during transition)
// But eventually they should be replaced by the new architecture.
export type Brand = 'Petron' | 'Solane' | 'M-Gas' | 'PryceGas' | 'Phoenix' | 'Isla';
export type CylinderSize = '2.7kg' | '5kg' | '11kg' | '50kg';
export type StockStatus = 'Full' | 'Empty' | 'Defective' | 'In-Transit';

export interface Cylinder {
  id: string;
  brand: Brand;
  size: CylinderSize;
  current_status: StockStatus;
  last_updated: string;
}
