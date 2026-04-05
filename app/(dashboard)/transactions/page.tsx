import { TransactionsView } from "@/components/transactions/transactions-view";
import { transactionsService } from "@/services/transactions-service";
import { lpgSizeService } from "@/services/lpg-size-service";

export default async function TransactionsPage() {
  const [transactions, sizes] = await Promise.all([
    transactionsService.getAll(),
    lpgSizeService.getAll()
  ]);
  
  return <TransactionsView initialTransactions={transactions} lpgSizes={sizes} />;
}
