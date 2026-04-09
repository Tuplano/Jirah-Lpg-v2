import { TransactionsView } from "@/components/transactions/transactions-view";
import { getAllTransactions } from "@/services/transactions-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function TransactionsPage() {
  const [txResponse, lpgSizes] = await Promise.all([
    getAllTransactions(1, 10),
    getAllLpgSizes()
  ]);
  
  return <TransactionsView initialTransactions={txResponse.data} initialCount={txResponse.count} lpgSizes={lpgSizes} />;
}
