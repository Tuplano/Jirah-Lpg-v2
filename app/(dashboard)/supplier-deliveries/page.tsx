import { SupplierDeliveriesView } from "@/components/supplier-deliveries/supplier-deliveries-view";
import { getAllSupplierDeliveries, getAllSuppliers } from "@/services/supplier-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function SupplierDeliveriesPage() {
  const [deliveriesResponse, suppliers, lpgSizes] = await Promise.all([
    getAllSupplierDeliveries(1, 10),
    getAllSuppliers(),
    getAllLpgSizes(),
  ]);

  return (
    <SupplierDeliveriesView
      initialDeliveries={deliveriesResponse.data}
      initialCount={deliveriesResponse.count}
      suppliers={suppliers}
      lpgSizes={lpgSizes}
    />
  );
}
