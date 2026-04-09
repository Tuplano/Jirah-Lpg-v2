import { SuppliersView } from "@/components/suppliers/suppliers-view";
import { getAllSuppliers } from "@/services/supplier-service";

export default async function SuppliersPage() {
  const suppliers = await getAllSuppliers();

  return (
    <SuppliersView
      initialSuppliers={suppliers}
    />
  );
}
