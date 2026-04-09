"use client";

import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSupplier } from "@/hooks/use-suppliers";
import { Supplier } from "@/types";

interface EditSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

export function EditSupplierDialog({ open, onOpenChange, supplier }: EditSupplierDialogProps) {
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [address, setAddress] = React.useState("");

  const { mutate: updateSupplier, isPending } = useUpdateSupplier();

  React.useEffect(() => {
    if (supplier && open) {
      setName(supplier.name);
      setContact(supplier.contact || "");
      setAddress(supplier.address || "");
    }
  }, [supplier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !supplier) return;

    updateSupplier({ id: supplier.id, data: { name, contact, address } }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base">Edit Supplier</DialogTitle>
            <DialogDescription className="text-sm">
              Update information for this supplier.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">Supplier Name *</Label>
              <Input
                id="edit-name"
                placeholder="Regasco Main"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contact" className="text-sm font-medium">Contact Number</Label>
              <Input
                id="edit-contact"
                placeholder="09xxxxxxxxx"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address" className="text-sm font-medium">Address</Label>
              <Input
                id="edit-address"
                placeholder="Street, Barangay, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
