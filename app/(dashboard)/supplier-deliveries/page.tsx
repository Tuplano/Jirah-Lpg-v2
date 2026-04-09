import { SupplierDeliveriesView } from "@/components/supplier-deliveries/supplier-deliveries-view";
import { getAllSupplierDeliveries, getAllSuppliers } from "@/services/supplier-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function SupplierDeliveriesPage() {
  const [deliveries, suppliers, lpgSizes] = await Promise.all([
    getAllSupplierDeliveries(),
    getAllSuppliers(),
    getAllLpgSizes(),
  ]);

  return (
    <SupplierDeliveriesView
      initialDeliveries={deliveries}
      suppliers={suppliers}
      lpgSizes={lpgSizes}
    />
  );
}
