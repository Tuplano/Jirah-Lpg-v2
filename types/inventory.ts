import { Brand, CylinderSize, StockStatus } from '@/types';

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
  status: 'Completed' | 'Pending' | 'Cancelled';
  items: {
    brand: Brand;
    size: CylinderSize;
    qty: number;
    type: 'Full Out' | 'Empty In' | 'Full In' | 'Empty Out';
  }[];
  total_amount?: number;
}
