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
import { useRefills } from "@/hooks/use-refills";
import { useLpgSizes } from "@/hooks/use-sales";
import { Skeleton } from "@/components/ui/skeleton";
import { RecordRefillDialog } from "./record-refill-dialog";
import { cn } from "@/lib/utils";

interface RefillsViewProps {
  initialRefills: any[];
  lpgSizes: any[];
}

export function RefillsView({ initialRefills, lpgSizes: initialLpgSizes }: RefillsViewProps) {
  const { data: refills, isLoading } = useRefills();
  const { data: lpgSizes } = useLpgSizes();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredRefills = (refills || initialRefills).filter((refill) =>
    refill.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refill.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRefills = (refills || initialRefills).filter((r: any) => r.status === 'pending');

  if (isLoading && !initialRefills) {
    return <div className="p-8 text-center text-muted-foreground">Loading refills history...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refill Shipments</h1>
          <p className="text-muted-foreground">Track outgoing and incoming cylinder refills with suppliers.</p>
        </div>
        <RecordRefillDialog 
          lpgSizes={lpgSizes || initialLpgSizes} 
          pendingRefills={pendingRefills}
        />
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
                      refill.status === 'completed'
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-secondary bg-secondary text-secondary-foreground"
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
                    <div className="flex items-center gap-1.5 text-accent-foreground">
                      <ArrowUpRight className="h-3 w-3" />
                      {new Date(refill.date_sent).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {refill.date_returned ? (
                      <div className="flex items-center gap-1.5 text-secondary-foreground">
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
