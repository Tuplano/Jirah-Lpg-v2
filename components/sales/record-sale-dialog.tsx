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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSale, useLpgSizes } from "@/hooks/use-sales";
import { useCustomerLpgPrice, useCustomers } from "@/hooks/use-customers";
import { ShoppingCart } from "lucide-react";
import { LpgSize } from "@/types/inventory";

interface RecordSaleDialogProps {
  lpgSizes?: LpgSize[];
}

export function RecordSaleDialog({ lpgSizes: initialLpgSizes }: RecordSaleDialogProps) {
  const { data: lpgSizes } = useLpgSizes();
  const { data: customers } = useCustomers();
  const [sizeId, setSizeId] = React.useState<string>("");
  const [customerId, setCustomerId] = React.useState<string>("walk-in");
  const [quantity, setQuantity] = React.useState("1");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [totalPrice, setTotalPrice] = React.useState("");
  const [type, setType] = React.useState<'sale' | 'exchange'>('sale');
  const [open, setOpen] = React.useState(false);
  const { mutate: createSale, isPending } = useCreateSale();
  const normalizedCustomerId = customerId === "walk-in" ? undefined : Number(customerId);
  const { data: customerPrice, isLoading: isLoadingCustomerPrice } = useCustomerLpgPrice(
    normalizedCustomerId,
    sizeId ? Number(sizeId) : undefined
  );
  const selectedSize = React.useMemo(
    () => (lpgSizes || initialLpgSizes)?.find((s) => s.id.toString() === sizeId),
    [sizeId, lpgSizes, initialLpgSizes]
  );

  React.useEffect(() => {
    if (selectedSize) {
      const resolvedUnitPrice = customerPrice?.price ?? selectedSize.price;
      setUnitPrice(resolvedUnitPrice.toString());
      setTotalPrice((resolvedUnitPrice * Number(quantity)).toString());
    }
  }, [selectedSize, quantity, customerPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeId) return;

    createSale({
      customer_id: normalizedCustomerId ?? null,
      lpg_size_id: Number(sizeId),
      quantity: Number(quantity),
      unit_price: Number(unitPrice),
      total_price: Number(totalPrice),
      type: type,
      note: `Sale: ${type}`
    }, {
      onSuccess: () => {
        setOpen(false);
        setSizeId("");
        setCustomerId("walk-in");
        setQuantity("1");
        setUnitPrice("");
        setTotalPrice("");
      }
    });
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Record Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
            <DialogDescription>
              Record a sale transaction. This will automatically deduct from the 'Full' stock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right text-xs">
                Product
              </Label>
              <div className="col-span-3">
                <Select onValueChange={setSizeId} value={sizeId} required>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select LPG size" />
                  </SelectTrigger>
                  <SelectContent>
                    {(lpgSizes || initialLpgSizes || []).map((size) => (
                      <SelectItem key={size.id} value={size.id.toString()}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right text-xs">
                Customer
              </Label>
              <div className="col-span-3">
                <Select onValueChange={setCustomerId} value={customerId}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in / Default Price</SelectItem>
                    {(customers || []).map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right text-xs">
                Type
              </Label>
              <div className="col-span-3">
                <Select onValueChange={(v: any) => setType(v)} value={type}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Straight Sale (No Exchange)</SelectItem>
                    <SelectItem value="exchange">Exchange (Plus Empty Tank)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="qty" className="text-right text-xs">
                Quantity
              </Label>
              <Input
                id="qty"
                type="number"
                min="1"
                className="col-span-3"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit-price" className="text-right text-xs">
                Unit Price
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="unit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {isLoadingCustomerPrice
                    ? "Checking customer price..."
                    : customerPrice
                      ? "Using customer-specific price."
                      : "Using standard LPG size price."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right text-xs">
                Total (PHP)
              </Label>
              <Input
                id="price"
                type="number"
                className="col-span-3"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || !sizeId || !unitPrice}>
              {isPending ? "Saving..." : "Process Sale"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
