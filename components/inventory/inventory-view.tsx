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
import { Search, Filter, Plus, Package } from "lucide-react";
import { Inventory, LpgSize, Refill } from "@/types/inventory";
import { AddSizeDialog } from "./add-size-dialog";

interface InventoryViewProps {
  initialStocks: Inventory[];
  unmanagedSizes: LpgSize[];
}

export function InventoryView({ initialStocks, unmanagedSizes }: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [stocks] = React.useState<Inventory[]>(initialStocks);

  const filteredStocks = stocks.filter((stock) =>
    stock.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage and track your LPG cylinder stock levels by size.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <AddSizeDialog unmanagedSizes={unmanagedSizes} />
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stocks.map((stock) => (
          <div key={stock.id} className="p-4 rounded-xl border bg-card shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">{stock.lpg_sizes?.name}</span>
              <Badge variant="outline" className="text-xs font-normal">
                PHP {stock.lpg_sizes?.price.toLocaleString()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm pt-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-tight">Full</span>
                <span className="font-semibold text-green-600">{stock.full_count}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-muted-foreground text-xs uppercase tracking-tight">Empty</span>
                <span className="font-semibold text-blue-600">{stock.empty_count}</span>
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-muted-foreground text-xs uppercase tracking-tight">Refill</span>
                <span className="font-semibold text-amber-600">{stock.for_refill_count}</span>
              </div>
              <div className="flex flex-col text-right pt-1">
                <span className="text-muted-foreground text-xs uppercase tracking-tight">Total</span>
                <span className="font-bold">
                  {stock.full_count + stock.empty_count + stock.for_refill_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by size name..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LPG Size</TableHead>
              <TableHead className="text-center text-green-600">Full</TableHead>
              <TableHead className="text-center text-blue-600">Empty</TableHead>
              <TableHead className="text-center text-amber-600">For Refill</TableHead>
              <TableHead className="text-center font-bold">Total Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.lpg_sizes?.name}</TableCell>
                  <TableCell className="text-center font-semibold text-green-700">{stock.full_count}</TableCell>
                  <TableCell className="text-center font-semibold text-blue-700">{stock.empty_count}</TableCell>
                  <TableCell className="text-center font-semibold text-amber-700">{stock.for_refill_count}</TableCell>
                  <TableCell className="text-center font-bold">
                    {stock.full_count + stock.empty_count + stock.for_refill_count}
                  </TableCell>
                  <TableCell className="text-right">
                    ₱{stock.lpg_sizes?.price.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No inventory data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
