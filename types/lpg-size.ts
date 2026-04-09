import { Supplier } from "./supplier";

export interface LpgSize {
  id: number;
  supplier_id: number;
  name: string;
  price: number;
  size: number;
  created_at: string;
  suppliers?: Supplier;
}
