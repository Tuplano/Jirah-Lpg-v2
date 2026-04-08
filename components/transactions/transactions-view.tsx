"use client";

import * as React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCcw, ShoppingCart } from "lucide-react";
import { Transaction, LpgSize } from "@/types/inventory";
import { RecordSaleDialog } from "../sales/record-sale-dialog";
import { ManualAdjustmentDialog } from "./manual-adjustment-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionsViewProps {
  initialTransactions: any[];
  lpgSizes: LpgSize[];
}

export function TransactionsView({ initialTransactions, lpgSizes }: TransactionsViewProps) {
  const { data: transactions, isLoading } = useTransactions();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredTransactions = (transactions || initialTransactions).filter((tx) =>
    tx.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <ShoppingCart className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Sale</span>
          </div>
        );
      case 'refill_send':
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground">
              <ArrowUpRight className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Sent for Refill</span>
          </div>
        );
      case 'refill_return':
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-secondary text-secondary-foreground">
              <ArrowDownLeft className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Refill Returned</span>
          </div>
        );
      case 'adjust':
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-zinc-100 flex items-center justify-center text-zinc-700">
              <RefreshCcw className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Adjustment</span>
          </div>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">All inventory movements, sales, and adjustments.</p>
        </div>
        <div className="flex gap-2">
          <ManualAdjustmentDialog lpgSizes={lpgSizes} />
          <RecordSaleDialog lpgSizes={lpgSizes} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search by size, type, or note..." 
          className="pl-9 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50">
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Type</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Date & Time</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Item</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em]">Qty</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>{getTransactionBadge(tx.type)}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(tx.created_at).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {tx.lpg_sizes?.name}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-sm">
                    {tx.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {tx.note || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                  No transaction history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
