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
import { Transaction, LpgSize } from "@/types/inventory";
import { ManualAdjustmentDialog } from "./manual-adjustment-dialog";

interface AdjustmentsViewProps {
  initialAdjustments: Transaction[];
  lpgSizes: LpgSize[];
}

export function AdjustmentsView({ initialAdjustments, lpgSizes }: AdjustmentsViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [adjustments] = React.useState<Transaction[]>(initialAdjustments);

  const filteredAdjustments = adjustments.filter((t) =>
    t.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
          <p className="text-muted-foreground">Historical records of manual inventory corrections.</p>
        </div>
        <div className="flex gap-2">
          <ManualAdjustmentDialog lpgSizes={lpgSizes} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by size or note..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdjustments.length > 0 ? (
              filteredAdjustments.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-zinc-100 flex items-center justify-center text-zinc-700">
                        <RefreshCcw className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium">Adjustment</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{new Date(tx.created_at).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {tx.lpg_sizes?.name}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                    {tx.note || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
