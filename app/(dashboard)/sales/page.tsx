import { SalesView } from "@/components/sales/sales-view";
import { getAllSales } from "@/services/sales-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function SalesPage() {
  const [salesResponse, lpgSizes] = await Promise.all([
    getAllSales(1, 10),
    getAllLpgSizes()
  ]);

  return <SalesView initialSales={salesResponse.data} initialCount={salesResponse.count} lpgSizes={lpgSizes} />;
}
