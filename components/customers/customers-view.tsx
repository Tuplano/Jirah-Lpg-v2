"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer, CustomerLpgPrice, LpgSize } from "@/types/inventory";
import { Users, Search, Tags } from "lucide-react";
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
import { useCustomerLpgPrices, useCustomers, useUpsertCustomerLpgPrice } from "@/hooks/use-customers";
import { AddCustomerDialog } from "./add-customer-dialog";

interface CustomersViewProps {
  initialCustomers: Customer[];
  lpgSizes: LpgSize[];
  initialCustomerPrices: CustomerLpgPrice[];
}

export function CustomersView({ initialCustomers, lpgSizes, initialCustomerPrices }: CustomersViewProps) {
  const { data: customers, isLoading } = useCustomers();
  const { data: customerPrices } = useCustomerLpgPrices();
  const [searchTerm, setSearchTerm] = React.useState("");
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
                        <div className="flex items-center justify-end gap-2">
                          <ManageCustomerPricesDialog
                            customer={customer}
                            lpgSizes={lpgSizes}
                            customerPrices={prices}
                          />
                        </div>
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
  const [draftPrices, setDraftPrices] = React.useState<Record<number, string>>({});
  const { mutateAsync: saveCustomerPrice, isPending } = useUpsertCustomerLpgPrice();

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const nextDrafts = Object.fromEntries(
      lpgSizes.map((size) => {
        const existing = customerPrices.find(
          (price) => price.customer_id === customer.id && price.lpg_size_id === size.id
        );

        return [size.id, existing ? existing.price.toString() : ""];
      })
    );

    setDraftPrices(nextDrafts);
  }, [open, customer.id, customerPrices, lpgSizes]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const entriesToSave = lpgSizes
      .map((size) => ({
        customer_id: customer.id,
        lpg_size_id: size.id,
        price: draftPrices[size.id],
      }))
      .filter((entry) => entry.price !== "");

    await Promise.all(
      entriesToSave.map((entry) =>
        saveCustomerPrice({
          customer_id: entry.customer_id,
          lpg_size_id: entry.lpg_size_id,
          price: Number(entry.price),
        })
      )
    );

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
          <Tags className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="text-base">{customer.name}</DialogTitle>
            <DialogDescription className="text-sm">
              Set custom prices for this customer. Leave blank to use standard pricing.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            {lpgSizes.map((size) => (
              <div key={size.id} className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`customer-${customer.id}-size-${size.id}`} className="text-sm font-medium">
                    {size.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">Standard: ₱{size.price.toLocaleString()}</p>
                </div>
                <Input
                  id={`customer-${customer.id}-size-${size.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={size.price.toString()}
                  value={draftPrices[size.id] ?? ""}
                  onChange={(e) =>
                    setDraftPrices((current) => ({
                      ...current,
                      [size.id]: e.target.value,
                    }))
                  }
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
