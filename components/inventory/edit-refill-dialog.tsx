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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateRefill } from "@/hooks/use-refills";
import { Plus, Trash2, RefreshCcw } from "lucide-react";
import { Inventory, LpgSize, RefillBatch } from "@/types";

interface EditRefillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refill: RefillBatch | null;
  lpgSizes: LpgSize[];
  inventory: Inventory[];
}

interface RefillProductRow {
  id: string;
  sizeId: string;
  quantity: string;
  pricePerKilo: string;
}

function getCurrentDateTimeLocal() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function EditRefillDialog({ open, onOpenChange, refill, lpgSizes, inventory }: EditRefillDialogProps) {
  const [products, setProducts] = React.useState<RefillProductRow[]>([]);
  const [sendDateTime, setSendDateTime] = React.useState(getCurrentDateTimeLocal);
  const { mutate: updateRefill, isPending } = useUpdateRefill();

  const lpgSizeMap = React.useMemo(
    () => new Map(lpgSizes.map((size) => [size.id, size])),
    [lpgSizes]
  );
  const inventoryMap = React.useMemo(
    () => new Map(inventory.map((item) => [item.lpg_size_id, item])),
    [inventory]
  );

  React.useEffect(() => {
    if (open && refill) {
      // Initialize products from existing refill
      const initialProducts = (refill.refill_batch_items || []).map((item) => ({
        id: crypto.randomUUID(),
        sizeId: item.lpg_size_id.toString(),
        quantity: item.quantity.toString(),
        pricePerKilo: item.price_per_kilo.toString(),
      }));
      setProducts(initialProducts.length > 0 ? initialProducts : [{
        id: crypto.randomUUID(),
        sizeId: "",
        quantity: "1",
        pricePerKilo: "",
      }]);
      setSendDateTime(new Date(refill.date_sent).toISOString().slice(0, 16));
    }
  }, [open, refill]);

  const canSubmit = products.every(
    (product) => {
      const quantity = Number(product.quantity);

      return (
        product.sizeId &&
        quantity > 0 &&
        product.pricePerKilo !== "" &&
        Number(product.pricePerKilo) >= 0
      );
    }
  );

  const sendTotalCost = products.reduce((sum, product) => {
    const selectedSize = lpgSizeMap.get(Number(product.sizeId));

    if (!selectedSize) {
      return sum;
    }

    return sum + Number(product.quantity || 0) * Number(product.pricePerKilo || 0) * selectedSize.size;
  }, 0);

  const addProductRow = () => {
    setProducts((current) => [
      ...current,
      { id: crypto.randomUUID(), sizeId: "", quantity: "1", pricePerKilo: "" },
    ]);
  };

  const updateProductRow = (id: string, updates: Partial<Omit<RefillProductRow, "id">>) => {
    setProducts((current) =>
      current.map((product) => {
        if (product.id !== id) {
          return product;
        }

        const nextProduct = { ...product, ...updates };
        return nextProduct;
      })
    );
  };

  const removeProductRow = (id: string) => {
    setProducts((current) => {
      if (current.length === 1) {
        return [{ id: crypto.randomUUID(), sizeId: "", quantity: "1", pricePerKilo: "" }];
      }

      return current.filter((product) => product.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!refill || !canSubmit) return;
    updateRefill({
      id: refill.id,
      data: {
        items: products.map((product) => ({
          lpg_size_id: Number(product.sizeId),
          quantity: Number(product.quantity),
          price_per_kilo: Number(product.pricePerKilo),
        })),
        date_sent: new Date(sendDateTime).toISOString()
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="p-6 pb-2 space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <RefreshCcw className="h-5 w-5" />
              <DialogTitle className="text-xl">Edit Refill Batch</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground/80">
              Update the products and details for this refill batch. Inventory will adjust automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 space-y-8">
            {/* Header Form Section */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="send-date-time" className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                  Send Date & Time
                </Label>
                <div className="relative">
                  <Input
                    id="send-date-time"
                    type="datetime-local"
                    value={sendDateTime}
                    max={getCurrentDateTimeLocal()}
                    onChange={(e) => setSendDateTime(e.target.value)}
                    className="h-10 border-border/60 bg-background/50 pl-10"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <RefreshCcw className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/60 ml-1">
                  Adjust if the shipment time was recorded incorrectly.
                </p>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <Label className="text-xs font-bold uppercase tracking-[0.1em] text-foreground">Refill Items</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addProductRow}
                  className="h-8 text-[11px] font-semibold text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1.5" />
                  Add Product
                </Button>
              </div>

              <div className="space-y-3">
                {products.map((product) => {
                  const selectedSize = lpgSizeMap.get(Number(product.sizeId));
                  const lineTotal = selectedSize
                    ? Number(product.quantity || 0) * Number(product.pricePerKilo || 0) * selectedSize.size
                    : 0;

                  return (
                    <div key={product.id} className="group flex flex-col sm:flex-row items-end gap-3 p-4 rounded-lg bg-muted/20 border border-border/40 hover:border-border/80 transition-all duration-200">
                      {/* LPG Size */}
                      <div className="flex-[2] w-full space-y-1.5">
                        <Label htmlFor={`size-${product.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Product</Label>
                        <Select
                          onValueChange={(value) => updateProductRow(product.id, { sizeId: value })}
                          value={product.sizeId}
                        >
                          <SelectTrigger id={`size-${product.id}`} className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {lpgSizes.filter(size => {
                              const invItem = inventoryMap.get(size.id);
                              const isCurrentlySelected = products.some(p => p.sizeId === size.id.toString());
                              return (invItem && invItem.empty_count > 0) || isCurrentlySelected;
                            }).map((size) => {
                              const invItem = inventoryMap.get(size.id);
                              return (
                                <SelectItem key={size.id} value={size.id.toString()}>
                                  {size.suppliers?.name ? `[${size.suppliers.name}] ` : ""}{size.name}
                                  <span className="ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                                    {invItem?.empty_count || 0} empty
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity */}
                      <div className="w-full sm:w-28 space-y-1.5">
                        <Label htmlFor={`qty-${product.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Qty</Label>
                        <Input
                          id={`qty-${product.id}`}
                          type="number"
                          min="1"
                          className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1 text-center font-medium"
                          value={product.quantity}
                          onChange={(e) => updateProductRow(product.id, { quantity: e.target.value })}
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="w-full sm:w-32 space-y-1.5">
                        <Label htmlFor={`price-${product.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">₱ / KG</Label>
                        <Input
                          id={`price-${product.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1 text-right font-medium pr-3"
                          value={product.pricePerKilo}
                          onChange={(e) => updateProductRow(product.id, { pricePerKilo: e.target.value })}
                        />
                      </div>

                      {/* Line Total Display */}
                      <div className="w-full sm:w-36 space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Line Cost</Label>
                        <div className="h-9 flex items-center justify-end px-3 rounded-md bg-background/50 border border-border/40 text-sm font-semibold text-primary">
                          ₱{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="pb-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProductRow(product.id)}
                          disabled={products.length === 1}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
            </div>

            {/* Batch Cost / Footer Summary */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Updated Batch Cost</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-medium text-primary/60">₱</span>
                    <span className="text-3xl font-bold tracking-tight text-primary">
                      {sendTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground/80 bg-background/50 px-4 py-2 rounded-full border border-border/40">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{products.length} Product{products.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-px h-3 bg-border/60" />
                  <span>{products.reduce((acc, current) => acc + Number(current.quantity || 0), 0)} Total Tanks</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border/40 gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-10 px-6 font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !canSubmit} className="h-10 px-8 font-bold gap-2 shadow-sm shadow-primary/20">
              {isPending ? (
                 <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}