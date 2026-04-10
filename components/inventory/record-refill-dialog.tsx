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
import { useRecordSentBatch } from "@/hooks/use-refills";
import { RefreshCcw, Plus, Trash2 } from "lucide-react";
import { Inventory, LpgSize } from "@/types";

interface RecordRefillDialogProps {
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

export function RecordRefillDialog({ lpgSizes, inventory }: RecordRefillDialogProps) {
  const [products, setProducts] = React.useState<RefillProductRow[]>([
    { id: crypto.randomUUID(), sizeId: "", quantity: "1", pricePerKilo: "" },
  ]);
  const [sendDateTime, setSendDateTime] = React.useState(getCurrentDateTimeLocal);
  const [open, setOpen] = React.useState(false);

  const { mutate: recordSentBatch, isPending } = useRecordSentBatch();
  const lpgSizeMap = React.useMemo(
    () => new Map(lpgSizes.map((size) => [size.id, size])),
    [lpgSizes]
  );
  const inventoryMap = React.useMemo(
    () => new Map(inventory.map((item) => [item.lpg_size_id, item])),
    [inventory]
  );
  const canSubmitSend = products.every(
    (product) => {
      const sizeId = Number(product.sizeId);
      const availableEmpty = inventoryMap.get(sizeId)?.empty_count ?? 0;
      const quantity = Number(product.quantity);

      return (
        product.sizeId &&
        quantity > 0 &&
        quantity <= availableEmpty &&
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

  const resetSendForm = () => {
    setProducts([{ id: crypto.randomUUID(), sizeId: "", quantity: "1", pricePerKilo: "" }]);
    setSendDateTime(getCurrentDateTimeLocal());
  };

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
        const availableEmpty = inventoryMap.get(Number(nextProduct.sizeId))?.empty_count ?? 0;
        const quantity = Number(nextProduct.quantity);

        if (nextProduct.quantity !== "" && quantity > availableEmpty) {
          nextProduct.quantity = availableEmpty > 0 ? String(availableEmpty) : "0";
        }

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
    
    if (!canSubmitSend) return;
    recordSentBatch({
      items: products.map((product) => ({
        lpg_size_id: Number(product.sizeId),
        quantity: Number(product.quantity),
        price_per_kilo: Number(product.pricePerKilo),
      })),
      date_sent: new Date(sendDateTime).toISOString()
    }, {
      onSuccess: () => {
        setOpen(false);
        resetSendForm();
      }
    });
  };

  React.useEffect(() => {
    if (!open) {
      resetSendForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 h-9">
          <RefreshCcw className="h-4 w-4" />
          Record Refill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Refill</DialogTitle>
            <DialogDescription>
              Send multiple LPG products in one refill batch.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-4 sm:items-center">
              <Label htmlFor="send-date-time" className="text-sm font-medium sm:text-right">
                Send Date & Time
              </Label>
              <div className="sm:col-span-3">
                <Input
                  id="send-date-time"
                  type="datetime-local"
                  value={sendDateTime}
                  max={getCurrentDateTimeLocal()}
                  onChange={(e) => setSendDateTime(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Defaults to today and the current time, but you can adjust it before saving.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Refill Products</Label>
                <p className="text-xs text-muted-foreground">
                  Add all LPG sizes included in this refill shipment.
                </p>
              </div>
              <Button type="button" variant="outline" className="gap-2" onClick={addProductRow}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="space-y-3">
              {products.map((product, index) => {
                const selectedSize = lpgSizeMap.get(Number(product.sizeId));
                const availableEmpty = inventoryMap.get(Number(product.sizeId))?.empty_count ?? 0;
                const lineTotal = selectedSize
                  ? Number(product.quantity || 0) * Number(product.pricePerKilo || 0) * selectedSize.size
                  : 0;
                const quantity = Number(product.quantity);
                const exceedsAvailable = product.sizeId !== "" && quantity > availableEmpty;

                return (
                  <div
                    key={product.id}
                    className="rounded-xl border bg-card/70 p-4 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Product {index + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          Select the LPG size, set the quantity, and enter today&apos;s refill rate.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProductRow(product.id)}
                        aria-label="Remove product row"
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_120px_140px_160px]">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Product
                        </Label>
                        <Select
                          onValueChange={(value) => updateProductRow(product.id, { sizeId: value })}
                          value={product.sizeId}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select LPG size" />
                          </SelectTrigger>
                          <SelectContent>
                            {lpgSizes.filter(size => {
                              const invItem = inventoryMap.get(size.id);
                              return invItem && invItem.empty_count > 0;
                            }).map((size) => {
                              const invItem = inventoryMap.get(size.id);
                              return (
                                <SelectItem key={size.id} value={size.id.toString()}>
                                  {size.suppliers?.name ? `[${size.suppliers.name}] ` : ""}{size.name}
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({invItem?.empty_count || 0} empty)
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Tank Size
                        </Label>
                        <div className="flex h-11 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium">
                          {selectedSize ? `${selectedSize.size} kg` : "Select first"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Quantity
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max={availableEmpty}
                          value={product.quantity}
                          className="h-11"
                          onChange={(e) => updateProductRow(product.id, { quantity: e.target.value })}
                        />
                        <p className={`text-xs ${exceedsAvailable ? "text-destructive" : "text-muted-foreground"}`}>
                          Available empty: {availableEmpty}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Price Per Kilo
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="100"
                          value={product.pricePerKilo}
                          className="h-11"
                          onChange={(e) => updateProductRow(product.id, { pricePerKilo: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border bg-muted/30 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          Formula
                        </p>
                        <p className="mt-1 text-sm">
                          {selectedSize
                            ? `₱${product.pricePerKilo || 0}/kg x ${selectedSize.size}kg x ${product.quantity || 0}`
                            : "Choose an LPG size to preview the formula"}
                        </p>
                      </div>

                      <div className="rounded-lg border bg-primary/5 px-3 py-2 text-right">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          Line Total
                        </p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          ₱{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  Batch cost is computed as price per kilo x LPG size x quantity.
                </span>
                <span className="font-semibold">
                  Total: ₱{sendTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isPending || !canSubmitSend}
            >
              {isPending ? "Recording..." : "Record Refills"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
