export type Brand = 'Petron' | 'Solane' | 'M-Gas' | 'PryceGas' | 'Phoenix' | 'Isla';
export type CylinderSize = '2.7kg' | '5kg' | '11kg' | '50kg';
export type StockStatus = 'Full' | 'Empty' | 'Defective' | 'In-Transit';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

export interface AppConfig {
  shopName: string;
  lowStockThreshold: number;
}
