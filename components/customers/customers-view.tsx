"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer, CustomerLpgPrice, LpgSize } from "@/types/inventory";
import { Users, Search, Phone, MapPin, Tags } from "lucide-react";
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
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !initialCustomers) {
     return <div className="p-8 text-center text-muted-foreground">Loading customers...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer database and track their transaction history.</p>
        </div>
        <AddCustomerDialog />
      </div>



      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or address..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="group relative rounded-lg border bg-card p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-muted group-hover:border-primary/20 transition-colors">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {customer.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{customer.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{customer.contact}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-dashed">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/50" />
                <span>{customer.address}</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Custom Tank Prices
              </p>
              <div className="mt-2 space-y-1 text-sm">
                {prices.filter((price) => price.customer_id === customer.id).length > 0 ? (
                  prices
                    .filter((price) => price.customer_id === customer.id)
                    .map((price) => (
                      <div key={price.id} className="flex items-center justify-between gap-3">
                        <span>{price.lpg_sizes?.name || `Size #${price.lpg_size_id}`}</span>
                        <span className="font-medium">₱{price.price.toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground">No overrides yet. Standard LPG prices will be used.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">View History</Button>
              <ManageCustomerPricesDialog
                customer={customer}
                lpgSizes={lpgSizes}
                customerPrices={prices}
              />
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No customers found</h3>
          <p className="text-muted-foreground">Try adjusting your search or add a new customer.</p>
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
        <Button
          variant="outline"
          size="sm"
          className="flex-1 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors"
        >
          <Tags className="mr-2 h-4 w-4" />
          Tank Prices
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{customer.name} Tank Prices</DialogTitle>
            <DialogDescription>
              Set optional custom prices per LPG size. Leave blank to keep using the standard LPG size price.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {lpgSizes.map((size) => (
              <div
                key={size.id}
                className="grid items-center gap-3 rounded-lg border bg-card/70 p-4 sm:grid-cols-[1.4fr_120px_160px]"
              >
                <div>
                  <p className="font-medium">{size.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Standard price: ₱{size.price.toLocaleString()} for {size.size} kg
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {size.size} kg
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`customer-${customer.id}-size-${size.id}`} className="text-xs">
                    Custom Price
                  </Label>
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
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Prices"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
