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
import { Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useRefills } from "@/hooks/use-refills";
import { useLpgSizes } from "@/hooks/use-sales";
import { useInventory } from "@/hooks/use-inventory";
import { RecordRefillDialog } from "./record-refill-dialog";
import { cn } from "@/lib/utils";
import { Inventory, LpgSize, RefillBatch, RefillProductSummary } from "@/types/inventory";

interface RefillsViewProps {
  initialRefills: RefillBatch[];
  lpgSizes: LpgSize[];
  initialInventory: Inventory[];
}

export function RefillsView({ initialRefills, lpgSizes: initialLpgSizes, initialInventory }: RefillsViewProps) {
  const { data: refills, isLoading } = useRefills();
  const { data: lpgSizes } = useLpgSizes();
  const { data: inventory } = useInventory();
  const [searchTerm, setSearchTerm] = React.useState("");
  const refillBatches = (refills || initialRefills) as RefillBatch[];
  const summarizedRefills: RefillProductSummary[] = refillBatches.map((batch) => {
    const items = batch.refill_batch_items || [];
    const names = items.map((item) => item.lpg_sizes?.name || "Unknown LPG Size");
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: `batch-${batch.id}`,
      names,
      total_quantity: totalQuantity,
      cost: batch.cost,
      date_sent: batch.date_sent,
      date_returned: batch.date_returned,
      status: batch.status,
      created_at: batch.created_at,
      note: batch.note,
      items,
    };
  });

  const filteredRefills = summarizedRefills.filter((refill) =>
    refill.names.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    refill.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refill.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRefills = refillBatches.filter((r) => r.status === 'pending');

  if (isLoading && !initialRefills) {
    return <div className="p-8 text-center text-muted-foreground">Loading refills history...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Refills</h1>
          <p className="text-sm text-muted-foreground">Track refill batches and returns.</p>
        </div>
        <RecordRefillDialog 
          lpgSizes={lpgSizes || initialLpgSizes} 
          inventory={inventory || initialInventory}
          pendingRefills={pendingRefills}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search by product, status, or note..." 
          className="pl-9 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50">
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Status</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Products</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em]">Qty</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Sent</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Returned</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-[0.08em]">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {filteredRefills.length > 0 ? (
              filteredRefills.map((refill) => (
                <TableRow key={refill.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-sm">
                    <Badge variant="outline" className={cn(
                      "capitalize",
                      refill.status === 'completed'
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-accent/20 bg-accent/10 text-accent-foreground"
                    )}>
                      {refill.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm">
                    <div className="space-y-0.5">
                      {refill.items.map((item) => (
                        <div key={item.id} className="text-xs">
                          <span className="font-medium">{item.quantity}x {item.lpg_sizes?.name}</span>
                          {item.lpg_sizes ? (
                            <span className="text-muted-foreground text-xs block">
                              ₱{(item.price_per_kilo * item.lpg_sizes.size * item.quantity).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-sm">
                    {refill.total_quantity}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1.5 text-accent-foreground">
                      <ArrowUpRight className="h-3 w-3" />
                      {new Date(refill.date_sent).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {refill.date_returned ? (
                      <div className="flex items-center gap-1.5 text-destructive">
                        <ArrowDownLeft className="h-3 w-3" />
                        {new Date(refill.date_returned).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {refill.cost ? `₱${refill.cost.toLocaleString()}` : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                  No refill records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
