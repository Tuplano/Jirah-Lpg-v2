import { RefillsView } from "@/components/inventory/refills-view";
import { getStockLevels } from "@/services/inventory-service";
import { getAllRefills } from "@/services/refill-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function RefillsPage() {
  const [refills, lpgSizes, inventory] = await Promise.all([
    getAllRefills(),
    getAllLpgSizes(),
    getStockLevels(),
  ]);

  return <RefillsView initialRefills={refills} lpgSizes={lpgSizes} initialInventory={inventory} />;
}
