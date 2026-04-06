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
import { Search, Filter, Plus, Package, History, Flame } from "lucide-react";
import { AddSizeDialog } from "./add-size-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory, useUnmanagedSizes } from "@/hooks/use-inventory";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryViewProps {
  initialStocks: Array<any>;
  unmanagedSizes: Array<any>;
}

export function InventoryView({ initialStocks, unmanagedSizes: initialUnmanaged }: InventoryViewProps) {
  const { data: stocks, isLoading, isError } = useInventory();
  const { data: unmanagedSizes } = useUnmanagedSizes();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredStocks = (stocks || initialStocks).filter((item) =>
    item.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Stock Inventory</h1>
          <p className="text-muted-foreground">Manage your physical LPG cylinder counts across all brands.</p>
        </div>
        <AddSizeDialog unmanagedSizes={unmanagedSizes || initialUnmanaged} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Full Tanks</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalFull}</div>
            <p className="mt-1 text-xs text-primary/80">Ready for sale</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/70 to-background border-accent shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-accent-foreground">Total Empty Tanks</CardTitle>
            <History className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">{totalEmpty}</div>
            <p className="mt-1 text-xs text-accent-foreground/80">Awaiting refill</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary to-background border-secondary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Total Overall</CardTitle>
            <Flame className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-foreground">{totalFull + totalEmpty}</div>
            <p className="mt-1 text-xs text-secondary-foreground/80">Combined assets</p>
          </CardContent>
        </Card>
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
              <TableHead className="text-center text-primary">Full</TableHead>
              <TableHead className="text-center text-secondary-foreground">Empty</TableHead>
              <TableHead className="text-center text-accent-foreground">For Refill</TableHead>
              <TableHead className="text-center font-bold">Total Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.lpg_sizes?.name}</TableCell>
                  <TableCell className="text-center font-semibold text-primary">{stock.full_count}</TableCell>
                  <TableCell className="text-center font-semibold text-secondary-foreground">{stock.empty_count}</TableCell>
                  <TableCell className="text-center font-semibold text-accent-foreground">{stock.for_refill_count}</TableCell>
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
