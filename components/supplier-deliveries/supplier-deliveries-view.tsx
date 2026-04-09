"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Supplier, SupplierDelivery, LpgSize } from "@/types";
import { Inbox, Search, Trash2, CheckCircle2, Factory } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecordDeliveryDialog } from "./record-delivery-dialog";
import { useDeleteSupplierDelivery, useUpdateSupplierDeliveryStatus } from "@/hooks/use-suppliers";

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
import { MoreHorizontal } from "lucide-react";

interface SupplierDeliveriesViewProps {
  initialDeliveries: SupplierDelivery[];
  suppliers: Supplier[];
  lpgSizes: LpgSize[];
}

export function SupplierDeliveriesView({ initialDeliveries, suppliers, lpgSizes }: SupplierDeliveriesViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateSupplierDeliveryStatus();
  const { mutate: deleteDelivery, isPending: isDeleting } = useDeleteSupplierDelivery();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDelivery, setSelectedDelivery] = React.useState<SupplierDelivery | null>(null);

  const filteredDeliveries = initialDeliveries.filter((d) => {
    const supplierName = d.suppliers?.name || "";
    return supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           d.type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supplier Deliveries</h1>
          <p className="text-sm text-muted-foreground">Manage inbound purchases and exchanges from your suppliers.</p>
        </div>
        <RecordDeliveryDialog suppliers={suppliers} lpgSizes={lpgSizes} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search by supplier name or type..." 
          className="pl-9 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredDeliveries.length > 0 ? (
        <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground whitespace-nowrap">Date & Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Supplier / Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground hidden md:table-cell">Items</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Total Cost</th>
                  <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredDeliveries.map((delivery) => {
                  const items = (delivery as any).supplier_delivery_items || [];
                  const totalItems = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

                  return (
                    <tr key={delivery.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{format(new Date(delivery.delivery_date), "MMM d, yyyy")}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(delivery.delivery_date), "h:mm a")}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                           <Factory className="h-4 w-4 text-muted-foreground" />
                           <span className="font-semibold">{delivery.suppliers?.name || "Unknown"}</span>
                        </div>
                        <Badge variant="outline" className="mt-1 capitalize text-[10px] h-5 tracking-wide">
                          {delivery.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs text-muted-foreground">
                          {totalItems} tanks
                          {delivery.delivery_fee > 0 && <span className="ml-1 text-primary/70">(+ ₱{delivery.delivery_fee.toLocaleString()} dev. fee)</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">
                        ₱{delivery.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                         <Badge 
                           variant={delivery.status === 'completed' ? 'default' : delivery.status === 'pending' ? 'secondary' : 'destructive'}
                           className={`capitalize text-xs font-medium ${delivery.status === 'completed' ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 shadow-none border-green-500/20' : ''}`}
                         >
                           {delivery.status}
                         </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {delivery.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => updateStatus({ id: delivery.id, status: 'completed' })}
                                className="gap-2 cursor-pointer text-green-600 focus:text-green-600"
                                disabled={isUpdating}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Mark Completed</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive gap-2 cursor-pointer focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete Record</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed border-border/50">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-3">
            <Inbox className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <h3 className="text-sm font-medium">No deliveries found</h3>
          <p className="text-xs text-muted-foreground mt-1">Record a new inbound delivery to see it here.</p>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this delivery from <span className="font-semibold text-foreground">{selectedDelivery?.suppliers?.name}</span>? 
              This will reverse the inventory changes if it was completed, and remove it from the database permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (selectedDelivery) {
                  deleteDelivery(selectedDelivery.id, {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      setSelectedDelivery(null);
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
