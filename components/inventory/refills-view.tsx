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
import { Search, Truck, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Refill, LpgSize } from   "@/types/inventory";
import { RecordRefillDialog } from "./record-refill-dialog";
import { cn } from "@/lib/utils";

interface RefillsViewProps {
  initialRefills: Refill[];
  lpgSizes: LpgSize[];
}

export function RefillsView({ initialRefills, lpgSizes }: RefillsViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [refills] = React.useState<Refill[]>(initialRefills);

  const filteredRefills = refills.filter((r) =>
    r.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRefills = refills.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refill Management</h1>
          <p className="text-muted-foreground">Track cylinder shipments to and returns from refill stations.</p>
        </div>
        <div className="flex gap-2">
          <RecordRefillDialog lpgSizes={lpgSizes} pendingRefills={pendingRefills} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by size or status..." 
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
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead>Date Sent</TableHead>
              <TableHead>Date Returned</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRefills.length > 0 ? (
              filteredRefills.map((refill) => (
                <TableRow key={refill.id}>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "capitalize",
                      refill.status === 'completed' ? "border-green-500 text-green-700 bg-green-50" : "border-amber-500 text-amber-700 bg-amber-50"
                    )}>
                      {refill.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-medium text-sm">
                    {refill.lpg_sizes?.name}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {refill.quantity}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <ArrowUpRight className="h-3 w-3" />
                      {new Date(refill.date_sent).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {refill.date_returned ? (
                      <div className="flex items-center gap-1.5 text-blue-700">
                        <ArrowDownLeft className="h-3 w-3" />
                        {new Date(refill.date_returned).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {refill.cost ? `₱${refill.cost.toLocaleString()}` : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
