import { InventoryView } from "@/components/inventory/inventory-view";
import { getStockLevels } from "@/services/inventory-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";
import { getAllRefills } from "@/services/refill-service";

export default async function InventoryPage() {
  const [stocks, sizes, refills] = await Promise.all([
    getStockLevels(),
    getAllLpgSizes(),
    getAllRefills()
  ]);

  const pendingRefills = refills.filter((r: any) => r.status === 'pending');
  
  return (
    <InventoryView 
      initialStocks={stocks} 
      lpgSizes={sizes} 
      pendingRefills={pendingRefills} 
    />
  );
}
