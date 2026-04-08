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
import { Input } from "@/components/ui/input";
import { Search, RefreshCcw } from "lucide-react";
import { LpgSize } from "@/types";
import { ManualAdjustmentDialog } from "./manual-adjustment-dialog";
import { useAdjustments } from "@/hooks/use-transactions";

interface AdjustmentsViewProps {
  initialAdjustments: any[];
  lpgSizes: LpgSize[];
}

export function AdjustmentsView({ initialAdjustments, lpgSizes }: AdjustmentsViewProps) {
  const { data: adjustments, isLoading } = useAdjustments();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredAdjustments = (adjustments || initialAdjustments).filter((adj) =>
    adj.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !initialAdjustments) {
    return <div className="p-8 text-center text-muted-foreground">Loading adjustments...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Adjustments</h1>
          <p className="text-sm text-muted-foreground">Manual inventory corrections and history.</p>
        </div>
        <div className="flex gap-2">
          <ManualAdjustmentDialog lpgSizes={lpgSizes} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search by size or note..." 
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
            {filteredAdjustments.length > 0 ? (
              filteredAdjustments.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-muted-foreground">
                        <RefreshCcw className="h-3 w-3" />
                      </div>
                      <span className="font-medium">Adjustment</span>
                    </div>
                  </TableCell>
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
                    <span className={tx.quantity > 0 ? 'text-primary' : 'text-destructive'}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {tx.note || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                  No adjustments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
