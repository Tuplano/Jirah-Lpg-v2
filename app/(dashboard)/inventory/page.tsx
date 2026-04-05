import { InventoryView } from "@/components/inventory/inventory-view";
import { inventoryService } from "@/services/inventory-service";
import { lpgSizeService } from "@/services/lpg-size-service";
import { refillService } from "@/services/refill-service";

export default async function InventoryPage() {
  const [stocks, sizes, refills] = await Promise.all([
    inventoryService.getStockLevels(),
    lpgSizeService.getAll(),
    refillService.getAll()
  ]);

  const pendingRefills = refills.filter(r => r.status === 'pending');
  
  return (
    <InventoryView 
      initialStocks={stocks} 
      lpgSizes={sizes} 
      pendingRefills={pendingRefills} 
    />
  );
}
