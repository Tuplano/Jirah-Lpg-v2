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
