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

export interface Customer {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface Transaction {
  id: string;
  date: string;
  customer_id?: string;
  items: {
    brand: Brand;
    size: CylinderSize;
    qty: number;
    type: 'Full Out' | 'Empty In' | 'Full In' | 'Empty Out'; // Full Out (Sale), Empty In (Return)
  }[];
  total_amount?: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
}
