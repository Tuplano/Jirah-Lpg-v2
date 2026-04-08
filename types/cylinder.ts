// Legacy types
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
