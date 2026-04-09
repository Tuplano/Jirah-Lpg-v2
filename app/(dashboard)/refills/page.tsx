import { RefillsView } from "@/components/inventory/refills-view";
import { getStockLevels } from "@/services/inventory-service";
import { getAllRefills } from "@/services/refill-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function RefillsPage() {
  const [refillsResponse, lpgSizes, inventory] = await Promise.all([
    getAllRefills(1, 10),
    getAllLpgSizes(),
    getStockLevels(),
  ]);

  return <RefillsView initialRefills={refillsResponse.data} initialCount={refillsResponse.count} lpgSizes={lpgSizes} initialInventory={inventory} />;
}
