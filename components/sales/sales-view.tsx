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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart } from "lucide-react";
import { RecordSaleDialog } from "./record-sale-dialog";
import { useLpgSizes, useSales } from "@/hooks/use-sales";
import { LpgSize } from "@/types/inventory";


interface SalesViewProps {
  initialSales: any[];
  lpgSizes?: LpgSize[];
}

export function SalesView({ initialSales, lpgSizes: initialLpgSizes }: SalesViewProps) {
  const { data: sales, isLoading } = useSales();
  const { data: lpgSizes } = useLpgSizes();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSales = (sales || initialSales).filter((sale) =>
    sale.lpg_sizes?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !initialSales) {
    return <div className="p-8 text-center text-muted-foreground">Loading sales history...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground">Track all LPG sales and revenue.</p>
        </div>
        <RecordSaleDialog lpgSizes={lpgSizes || initialLpgSizes} />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-card shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{filteredSales.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search by LPG size or customer..." 
          className="pl-9 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50">
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Date & Time</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Item</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Customer</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em]">Qty</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-[0.08em]">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(sale.created_at).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {sale.lpg_sizes?.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sale.customers?.name || "Walk-in"}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-sm">
                    {sale.quantity}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm text-primary">
                    ₱{sale.total_price.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                  No sales found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
