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
import { Button } from "@/components/ui/button";
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
          <h1 className="text-3xl font-bold tracking-tight">Sales Records</h1>
          <p className="text-muted-foreground">Track all LPG sales, customer returns, and revenue in one place.</p>
        </div>
        <RecordSaleDialog lpgSizes={lpgSizes || initialLpgSizes} />
      </div>


      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{filteredSales.length}</div>
            <p className="mt-1 text-xs text-primary/80">Transactions recorded</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by LPG size..." 
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
              <TableHead className="text-right">Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
                        <ShoppingCart className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium capitalize">{sale.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{new Date(sale.created_at).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {sale.lpg_sizes?.name}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {sale.quantity}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    ₱{sale.total_price.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No sales history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
