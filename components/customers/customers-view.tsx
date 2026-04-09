"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer, CustomerLpgPrice, LpgSize } from "@/types";
import { Users, Search, Tags, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCustomerLpgPrices, useCustomers, useUpsertCustomerLpgPrice, useDeleteCustomer, useDeleteCustomerLpgPrice } from "@/hooks/use-customers";
import { AddCustomerDialog } from "./add-customer-dialog";
import { EditCustomerDialog } from "./edit-customer-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

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
import { MoreHorizontal, Edit } from "lucide-react";

interface CustomersViewProps {
  initialCustomers: Customer[];
  lpgSizes: LpgSize[];
  initialCustomerPrices: CustomerLpgPrice[];
}

export function CustomersView({ initialCustomers, lpgSizes, initialCustomerPrices }: CustomersViewProps) {
  const { data: customers, isLoading } = useCustomers();
  const { data: customerPrices } = useCustomerLpgPrices();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

  const prices = customerPrices || initialCustomerPrices;

  const filteredCustomers = (customers || initialCustomers).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !initialCustomers) {
     return <div className="p-8 text-center text-muted-foreground">Loading customers...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage your customer database and pricing.</p>
        </div>
        <AddCustomerDialog />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search by name, contact, or address..." 
          className="pl-9 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCustomers.length > 0 ? (
        <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground hidden sm:table-cell">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground hidden md:table-cell">Address</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-[0.08em] text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredCustomers.map((customer) => {
                  const customerCustomPrices = prices.filter((p) => p.customer_id === customer.id);
                  
                  return (
                    <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{customer.name}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{customer.contact}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        <a href={`tel:${customer.contact}`} className="hover:text-primary transition-colors">
                          {customer.contact}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        <p className="truncate text-xs max-w-xs">{customer.address}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setEditDialogOpen(true);
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <ManageCustomerPricesDialog
                              customer={customer}
                              lpgSizes={lpgSizes}
                              customerPrices={prices}
                            />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive gap-2 cursor-pointer focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete Customer</span>
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
            <Users className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <h3 className="text-sm font-medium">No customers found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or add a new customer to get started.</p>
        </div>
      )}

      {/* Dialogs */}
      <EditCustomerDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        customer={selectedCustomer} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{selectedCustomer?.name}</span>? 
              This will remove all their data, including custom pricing history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (selectedCustomer) {
                  deleteCustomer(selectedCustomer.id, {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      setSelectedCustomer(null);
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

function ManageCustomerPricesDialog({
  customer,
  lpgSizes,
  customerPrices,
}: {
  customer: Customer;
  lpgSizes: LpgSize[];
  customerPrices: CustomerLpgPrice[];
}) {
  const [open, setOpen] = React.useState(false);
  
  // Track which sizes have custom pricing managed
  const [selectedSizeIds, setSelectedSizeIds] = React.useState<number[]>([]);
  const [draftPrices, setDraftPrices] = React.useState<Record<number, string>>({});
  const [sizeToAdd, setSizeToAdd] = React.useState<string>("");
  
  const { mutateAsync: saveCustomerPrice, isPending: isSaving } = useUpsertCustomerLpgPrice();
  const { mutateAsync: deleteCustomerPrice, isPending: isDeleting } = useDeleteCustomerLpgPrice();

  const isPending = isSaving || isDeleting;

  React.useEffect(() => {
    if (!open) {
      setSizeToAdd("");
      return;
    }

    const sizesWithPrices = lpgSizes.filter(size => 
      customerPrices.some(p => p.customer_id === customer.id && p.lpg_size_id === size.id)
    );

    setSelectedSizeIds(sizesWithPrices.map(s => s.id));

    const nextDrafts = Object.fromEntries(
      sizesWithPrices.map((size) => {
        const existing = customerPrices.find(
          (price) => price.customer_id === customer.id && price.lpg_size_id === size.id
        );
        return [size.id, existing ? existing.price.toString() : ""];
      })
    );
    setDraftPrices(nextDrafts);
  }, [open, customer.id, customerPrices, lpgSizes]);

  const handleAddSize = () => {
    if (!sizeToAdd) return;
    const sizeId = parseInt(sizeToAdd, 10);
    if (!selectedSizeIds.includes(sizeId)) {
      setSelectedSizeIds((current) => [...current, sizeId]);
      setDraftPrices((current) => ({
        ...current,
        [sizeId]: "", // initialize with blank
      }));
    }
    setSizeToAdd("");
  };

  const handleRemoveSize = (sizeId: number) => {
    setSelectedSizeIds((current) => current.filter(id => id !== sizeId));
    setDraftPrices((current) => {
      const updated = { ...current };
      delete updated[sizeId];
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Elements currently present in the list
    const entriesToSave = selectedSizeIds
      .map((sizeId) => ({
        customer_id: customer.id,
        lpg_size_id: sizeId,
        price: draftPrices[sizeId],
      }))
      .filter((entry) => entry.price && entry.price !== "");

    // Find entries that existed before but are either removed or left blank
    const previouslyExistingPrices = customerPrices.filter(
      (price) => price.customer_id === customer.id
    );

    const entriesToDelete = previouslyExistingPrices.filter((existing) => {
      // It is deleted if it's no longer in selectedSizeIds OR if its draft price is empty
      const isSelected = selectedSizeIds.includes(existing.lpg_size_id);
      const draftPrice = draftPrices[existing.lpg_size_id];
      return !isSelected || !draftPrice || draftPrice === "";
    });

    await Promise.all([
      ...entriesToSave.map((entry) =>
        saveCustomerPrice({
          customer_id: entry.customer_id,
          lpg_size_id: entry.lpg_size_id,
          price: Number(entry.price),
        })
      ),
      ...entriesToDelete.map((entry) =>
        deleteCustomerPrice({
          customerId: entry.customer_id,
          lpgSizeId: entry.lpg_size_id,
        })
      )
    ]);

    setOpen(false);
  };

  const unselectedSizes = lpgSizes.filter(size => !selectedSizeIds.includes(size.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
          <Tags className="h-4 w-4 text-muted-foreground" />
          <span>Manage Pricing</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base">{customer.name}</DialogTitle>
            <DialogDescription className="text-sm">
              Set custom prices for this customer. Standard prices will be used for unselected sizes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1">
              <Select value={sizeToAdd} onValueChange={setSizeToAdd}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select LPG Size to add..." />
                </SelectTrigger>
                <SelectContent>
                  {unselectedSizes.length > 0 ? (
                    unselectedSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id.toString()}>
                        {size.name} (Std: ₱{size.price.toLocaleString()})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      All sizes added
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              className="h-9"
              onClick={handleAddSize}
              disabled={!sizeToAdd || sizeToAdd === "none"}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="grid gap-3 py-2">
            {selectedSizeIds.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-md">
                No custom prices set. Standard pricing will apply.
              </div>
            ) : (
              selectedSizeIds.map((sizeId) => {
                const size = lpgSizes.find(s => s.id === sizeId);
                if (!size) return null;
                return (
                  <div key={size.id} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/10">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`customer-${customer.id}-size-${size.id}`} className="text-sm font-medium">
                        {size.name}
                      </Label>
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">Standard: ₱{size.price.toLocaleString()}</p>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveSize(size.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-medium">₱</span>
                      <Input
                        id={`customer-${customer.id}-size-${size.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter custom price..."
                        required
                        value={draftPrices[size.id] ?? ""}
                        onChange={(e) =>
                          setDraftPrices((current) => ({
                            ...current,
                            [size.id]: e.target.value,
                          }))
                        }
                        className="h-9 text-sm font-medium"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} disabled={isPending} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving..." : "Save Custom Prices"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
