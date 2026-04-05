import { RefillsView } from "@/components/inventory/refills-view";
import { getAllRefills } from "@/services/refill-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function RefillsPage() {
  const [refills, lpgSizes] = await Promise.all([
    getAllRefills(),
    getAllLpgSizes()
  ]);

  return <RefillsView initialRefills={refills} lpgSizes={lpgSizes} />;
}
