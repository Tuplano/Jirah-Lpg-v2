"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Supplier } from "@/types";
import { Building2, Search, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSuppliers, useDeleteSupplier } from "@/hooks/use-suppliers";
import { AddSupplierDialog } from "./add-supplier-dialog";
import { EditSupplierDialog } from "./edit-supplier-dialog";

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

interface SuppliersViewProps {
  initialSuppliers: Supplier[];
}

export function SuppliersView({ initialSuppliers }: SuppliersViewProps) {
  const { data: suppliers, isLoading } = useSuppliers();
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);

  const filteredSuppliers = (suppliers || initialSuppliers).filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.contact && s.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading && !initialSuppliers) {
     return <div className="p-8 text-center text-muted-foreground">Loading suppliers...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">Manage your external LPG suppliers (Plantas).</p>
        </div>
        <AddSupplierDialog />
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

      {filteredSuppliers.length > 0 ? (
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
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {supplier.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{supplier.contact}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {supplier.contact ? (
                        <a href={`tel:${supplier.contact}`} className="hover:text-primary transition-colors">
                          {supplier.contact}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <p className="truncate text-xs max-w-xs">{supplier.address || "-"}</p>
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
                              setSelectedSupplier(supplier);
                              setEditDialogOpen(true);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive gap-2 cursor-pointer focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Supplier</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed border-border/50">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-3">
            <Building2 className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <h3 className="text-sm font-medium">No suppliers found</h3>
          <p className="text-xs text-muted-foreground mt-1">Add a new supplier to get started.</p>
        </div>
      )}

      {/* Dialogs */}
      <EditSupplierDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        supplier={selectedSupplier} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{selectedSupplier?.name}</span>? 
              This will remove all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (selectedSupplier) {
                  deleteSupplier(selectedSupplier.id, {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      setSelectedSupplier(null);
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
