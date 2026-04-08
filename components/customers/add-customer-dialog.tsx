"use client";

import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateCustomer } from "@/hooks/use-customers";

export function AddCustomerDialog() {
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const { mutate: addCustomer, isPending } = useCreateCustomer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCustomer({ name, contact, address }, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        setContact("");
        setAddress("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 h-9">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base">New Customer</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new customer to your database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">Customer Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact" className="text-sm font-medium">Contact Number</Label>
              <Input
                id="contact"
                placeholder="09xxxxxxxxx"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-sm font-medium">Address</Label>
              <Input
                id="address"
                placeholder="Street, Barangay, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
