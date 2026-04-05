import { InventoryView } from "@/components/inventory/inventory-view";
import { getStockLevels } from "@/services/inventory-service";
import { getUnmanagedSizes } from "@/services/lpg-size-service";

export default async function InventoryPage() {
  const [stocks, unmanagedSizes] = await Promise.all([
    getStockLevels(),
    getUnmanagedSizes()
  ]);

  return (
    <InventoryView 
      initialStocks={stocks} 
      unmanagedSizes={unmanagedSizes}
    />
  );
}
