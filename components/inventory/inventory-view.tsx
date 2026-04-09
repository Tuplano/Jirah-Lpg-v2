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
import { Search, Flame, Package, History } from "lucide-react";
import { AddSizeDialog } from "./add-size-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory, useUnmanagedSizes } from "@/hooks/use-inventory";

interface InventoryViewProps {
  initialStocks: Array<any>;
  unmanagedSizes: Array<any>;
}

export function InventoryView({ initialStocks, unmanagedSizes: initialUnmanaged }: InventoryViewProps) {
  const { data: stocks, isLoading, isError } = useInventory();
  const { data: unmanagedSizes } = useUnmanagedSizes();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredStocks = (stocks || initialStocks).filter((item) =>
    item.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lpg_sizes?.suppliers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFull = filteredStocks.reduce((acc, item) => acc + item.full_count, 0);
  const totalEmpty = filteredStocks.reduce((acc, item) => acc + item.empty_count, 0);

  if (isLoading && !initialStocks) {
    return <div className="p-8 text-center">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage your LPG cylinder stock levels.</p>
        </div>
        <AddSizeDialog unmanagedSizes={unmanagedSizes || initialUnmanaged} />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-card shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Full Tanks</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalFull}</div>
            <p className="mt-1 text-xs text-muted-foreground">Ready for sale</p>
          </CardContent>
        </Card>
        <Card className="border border-destructive/20 bg-gradient-to-br from-destructive/5 to-card shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Empty Tanks</CardTitle>
            <History className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{totalEmpty}</div>
            <p className="mt-1 text-xs text-muted-foreground">Awaiting refill</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
            <Flame className="h-5 w-5 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFull + totalEmpty}</div>
            <p className="mt-1 text-xs text-muted-foreground">Combined cylinders</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search by size name..." 
          className="pl-9 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50">
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Brand</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Size</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em] text-primary">Full</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em] text-destructive">Empty</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em]">For Refill</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em]">Total</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-[0.08em]">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <TableRow key={stock.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium text-sm text-foreground/80">
                    {stock.lpg_sizes?.suppliers?.name || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{stock.lpg_sizes?.name}</TableCell>
                  <TableCell className="text-center font-semibold text-sm text-primary">{stock.full_count}</TableCell>
                  <TableCell className="text-center font-semibold text-sm text-destructive">{stock.empty_count}</TableCell>
                  <TableCell className="text-center font-semibold text-sm text-accent">{stock.for_refill_count}</TableCell>
                  <TableCell className="text-center font-bold text-sm">
                    {stock.full_count + stock.empty_count + stock.for_refill_count}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    ₱{stock.lpg_sizes?.price.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
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
