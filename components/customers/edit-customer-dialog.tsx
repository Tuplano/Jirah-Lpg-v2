"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types";
import { useUpdateCustomer } from "@/hooks/use-customers";

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function EditCustomerDialog({ open, onOpenChange, customer }: EditCustomerDialogProps) {
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [address, setAddress] = React.useState("");
  
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

  React.useEffect(() => {
    if (open && customer) {
      setName(customer.name);
      setContact(customer.contact);
      setAddress(customer.address);
    }
  }, [open, customer]);

  if (!customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer(
      { 
        id: customer.id, 
        data: { name, contact, address } 
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base">Edit Customer</DialogTitle>
            <DialogDescription className="text-sm">
              Update the customer's contact information and address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact" className="text-sm font-medium">
                Contact Number
              </Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Home Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={isPending} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
