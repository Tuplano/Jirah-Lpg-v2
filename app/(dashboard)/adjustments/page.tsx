import { AdjustmentsView } from "@/components/transactions/adjustments-view";
import { getAllAdjustments } from "@/services/transactions-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function AdjustmentsPage() {
  const [adjustments, lpgSizes] = await Promise.all([
    getAllAdjustments(),
    getAllLpgSizes()
  ]);

  return <AdjustmentsView initialAdjustments={adjustments} lpgSizes={lpgSizes} />;
}
