import { TransactionsView } from "@/components/transactions/transactions-view";
import { getAllTransactions } from "@/services/transactions-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function TransactionsPage() {
  const [transactions, lpgSizes] = await Promise.all([
    getAllTransactions(),
    getAllLpgSizes()
  ]);
  
  return <TransactionsView initialTransactions={transactions} lpgSizes={lpgSizes} />;
}
