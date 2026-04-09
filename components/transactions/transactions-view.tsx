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
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCcw, ShoppingCart, Trash2, Pencil, Plus } from "lucide-react";
import { Transaction, LpgSize } from "@/types";
import { RecordSaleDialog } from "../sales/record-sale-dialog";
import { ManualAdjustmentDialog } from "./manual-adjustment-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionsViewProps {
  initialTransactions: Transaction[];
  initialCount: number;
  lpgSizes: LpgSize[];
}

export function TransactionsView({ initialTransactions, initialCount, lpgSizes }: TransactionsViewProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const { data: txResponse, isLoading } = useTransactions(currentPage, pageSize);
  const [searchTerm, setSearchTerm] = React.useState("");

  const transactions = txResponse?.data || initialTransactions;
  const totalCount = txResponse?.count || initialCount;
  const totalPages = Math.ceil(totalCount / pageSize);

  const filteredTransactions = transactions.filter((tx) =>
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
            <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-foreground">
              <RefreshCcw className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Adjustment</span>
          </div>
        );
      case 'delete':
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-destructive/10 flex items-center justify-center text-destructive">
              <Trash2 className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Deleted</span>
          </div>
        );
      case 'create':
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Created</span>
          </div>
        );
      case 'update':
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-secondary/30 flex items-center justify-center text-secondary-foreground">
              <Pencil className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Updated</span>
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
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Ref</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em]">Qty Change</TableHead>
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
                    {tx.lpg_sizes?.name || '—'}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {tx.reference_table ? (
                      <span className="bg-muted px-1.5 py-0.5 rounded border border-border/50">
                        {tx.reference_table.slice(0, 1).toUpperCase()}{tx.reference_id}
                      </span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    <div className="flex flex-col items-center">
                      <span className={`font-semibold ${tx.quantity > 0 ? 'text-primary' : tx.quantity < 0 ? 'text-destructive' : ''}`}>
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                      </span>
                      {tx.old_quantity !== null && tx.new_quantity !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          {tx.old_quantity} → {tx.new_quantity}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {tx.note || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                  No transaction history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-t border-border/25 mt-2">
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
          </p>
          <div className="order-1 sm:order-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page} className="hidden sm:inline-block">
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
