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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
import { Search, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Trash2, Edit, RotateCcw } from "lucide-react";
import { useRefills, useDeleteRefill } from "@/hooks/use-refills";
import { useLpgSizes } from "@/hooks/use-sales";
import { useInventory } from "@/hooks/use-inventory";
import { RecordRefillDialog } from "./record-refill-dialog";
import { ReturnRefillDialog } from "./return-refill-dialog";
import { EditRefillDialog } from "./edit-refill-dialog";
import { cn } from "@/lib/utils";
import { Inventory, LpgSize, RefillBatch, RefillProductSummary } from "@/types/inventory";

interface RefillsViewProps {
  initialRefills: RefillBatch[];
  lpgSizes: LpgSize[];
  initialInventory: Inventory[];
}

export function RefillsView({ initialRefills, lpgSizes: initialLpgSizes, initialInventory }: RefillsViewProps) {
  const { data: refills, isLoading } = useRefills();
  const { data: lpgSizes } = useLpgSizes();
  const { data: inventory } = useInventory();
  const { mutate: deleteRefill, isPending: isDeleting } = useDeleteRefill();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [returnDialogOpen, setReturnDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedRefill, setSelectedRefill] = React.useState<RefillBatch | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [refillToDelete, setRefillToDelete] = React.useState<RefillBatch | null>(null);
  const refillBatches = (refills || initialRefills) as RefillBatch[];
  const summarizedRefills: RefillProductSummary[] = refillBatches.map((batch) => {
    const items = batch.refill_batch_items || [];
    const names = items.map((item) => item.lpg_sizes?.name || "Unknown LPG Size");
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: `batch-${batch.id}`,
      names,
      total_quantity: totalQuantity,
      cost: batch.cost,
      date_sent: batch.date_sent,
      date_returned: batch.date_returned,
      status: batch.status,
      created_at: batch.created_at,
      note: batch.note,
      items,
    };
  });

  const filteredRefills = summarizedRefills.filter((refill) =>
    refill.names.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    refill.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refill.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !initialRefills) {
    return <div className="p-8 text-center text-muted-foreground">Loading refills history...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Refills</h1>
          <p className="text-sm text-muted-foreground">Track refill batches and returns.</p>
        </div>
        <RecordRefillDialog 
          lpgSizes={lpgSizes || initialLpgSizes} 
          inventory={inventory || initialInventory}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search by product, status, or note..." 
          className="pl-9 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50">
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Status</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Products</TableHead>
              <TableHead className="text-center font-semibold text-xs uppercase tracking-[0.08em]">Qty</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Sent</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Returned</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-[0.08em]">Cost</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-[0.08em]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {filteredRefills.length > 0 ? (
              filteredRefills.map((refill) => (
                <TableRow key={refill.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-sm">
                    <Badge className={cn(
                      "capitalize font-medium",
                      refill.status === 'completed'
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    )}>
                      {refill.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm">
                    <div className="space-y-0.5">
                      {refill.items.map((item) => (
                        <div key={item.id} className="text-xs">
                          <span className="font-medium">{item.quantity}x {item.lpg_sizes?.name}</span>
                          {item.lpg_sizes ? (
                            <span className="text-muted-foreground text-xs block">
                              ₱{(item.price_per_kilo * item.lpg_sizes.size * item.quantity).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-sm">
                    {refill.total_quantity}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <ArrowUpRight className="h-3 w-3 text-accent" />
                      {new Date(refill.date_sent).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {refill.date_returned ? (
                      <div className="flex items-center gap-1.5 text-foreground">
                        <ArrowDownLeft className="h-3 w-3 text-destructive" />
                        {new Date(refill.date_returned).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {refill.cost ? `₱${refill.cost.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {refill.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRefill(refillBatches.find(b => b.id === parseInt(refill.id.split('-')[1])) || null);
                                setReturnDialogOpen(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Return
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRefill(refillBatches.find(b => b.id === parseInt(refill.id.split('-')[1])) || null);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setRefillToDelete(refillBatches.find(b => b.id === parseInt(refill.id.split('-')[1])) || null);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
                  No refill records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ReturnRefillDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        refill={selectedRefill}
      />

      <EditRefillDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        refill={selectedRefill}
        lpgSizes={lpgSizes || initialLpgSizes}
        inventory={inventory || initialInventory}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Refill Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this refill batch? This action cannot be undone and will reverse all inventory changes made when this batch was sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (refillToDelete) {
                  deleteRefill(refillToDelete.id, {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      setRefillToDelete(null);
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
