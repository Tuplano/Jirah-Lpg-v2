import { SalesView } from "@/components/sales/sales-view";
import { getAllSales } from "@/services/sales-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function SalesPage() {
  const [sales, lpgSizes] = await Promise.all([
    getAllSales(),
    getAllLpgSizes()
  ]);

  return <SalesView initialSales={sales} lpgSizes={lpgSizes} />;
}
