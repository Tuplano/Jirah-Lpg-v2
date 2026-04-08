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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, ShoppingCart, MoreHorizontal, Trash2, Edit, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordSaleDialog } from "./record-sale-dialog";
import { EditSaleDialog } from "./edit-sale-dialog";
import { useLpgSizes, useSales, useDeleteSale } from "@/hooks/use-sales";
import { LpgSize, Sale } from "@/types";


interface SalesViewProps {
  initialSales: any[];
  lpgSizes?: LpgSize[];
}

export function SalesView({ initialSales, lpgSizes: initialLpgSizes }: SalesViewProps) {
  const { data: sales, isLoading } = useSales();
  const { data: lpgSizes } = useLpgSizes();
  const { mutate: deleteSale, isPending: isDeleting } = useDeleteSale();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);

  const filteredSales = (sales || initialSales).filter((sale) => {
    const productNames = sale.sales_items?.map((item: any) => item.lpg_sizes?.name).filter(Boolean).join(", ").toLowerCase() || "";
    const customerName = sale.customers?.name.toLowerCase() || "";
    return productNames.includes(searchTerm.toLowerCase()) || customerName.includes(searchTerm.toLowerCase());
  });

  if (isLoading && !initialSales) {
    return <div className="p-8 text-center text-muted-foreground">Loading sales history...</div>;
  }

  // Calculate stats
  const totalRevenue = (sales || initialSales).reduce((sum: number, sale: any) => sum + Number(sale.total_price || 0), 0);
  const totalItems = (sales || initialSales).reduce((sum: number, sale: any) => {
    return sum + (sale.sales_items?.reduce((s: number, item: any) => s + item.quantity, 0) || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground">Track all LPG sales transactions and revenue.</p>
        </div>
        <RecordSaleDialog lpgSizes={lpgSizes || initialLpgSizes} />
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        {/* Total Sales */}
        <div className="group relative rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-border hover:bg-card hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transactions</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{filteredSales.length}</p>
            </div>
            <ShoppingCart className="h-5 w-5 text-primary/40 transition-colors group-hover:text-primary/60" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="group relative rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-border hover:bg-card hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenue</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-primary/40 transition-colors group-hover:text-primary/60">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.16 2.75a.75.75 0 0 0-.76.75v9.67l-1.97-1.97a.75.75 0 0 0-1.06 1.06l3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 0 0-1.06-1.06l-1.97 1.97V3.5a.75.75 0 0 0-.84-.75zM15.75 11a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 1-.75.75h-11a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-1.5 0v4.5a2.25 2.25 0 0 0 2.25 2.25h11a2.25 2.25 0 0 0 2.25-2.25v-4.5a.75.75 0 0 0-.75-.75z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Units Sold */}
        <div className="group relative rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-border hover:bg-card hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Units Sold</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{totalItems}</p>
            </div>
            <Package className="h-5 w-5 text-primary/40 transition-colors group-hover:text-primary/60" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input 
          placeholder="Search by product, customer..." 
          className="pl-9 h-9 text-sm border-border/50 focus:border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Date & Time</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Products</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Customer</TableHead>
                <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Qty</TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Total</TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const productNames = sale.sales_items?.map((item: any) => item.lpg_sizes?.name).filter(Boolean).join(", ") || "—";
                  const totalItems = sale.sales_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                  
                  return (
                    <TableRow key={sale.id} className="border-border/50 hover:bg-muted/20 transition-colors">
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{new Date(sale.created_at).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-xs truncate">
                        {productNames}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sale.customers?.name || <span className="text-muted-foreground/60">Walk-in</span>}
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold">
                        {totalItems}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-primary">
                        ₱{sale.total_price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSale(sale);
                                setEditDialogOpen(true);
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit Sale</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSale(sale);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive gap-2 cursor-pointer focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete Sale</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                    No sales found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditSaleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        sale={selectedSale}
        lpgSizes={lpgSizes || initialLpgSizes}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sale? This will reverse the inventory changes and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedSale) {
                  deleteSale(selectedSale.id, {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      setSelectedSale(null);
                    }
                  });
                }
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
