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
import { useUpdateSale } from "@/hooks/use-sales";
import { useCustomers } from "@/hooks/use-customers";
import { Sale, LpgSize } from "@/types";
import { getCustomerLpgPrice } from "@/services/customer-service";
import { Plus, Trash2 } from "lucide-react";

interface EditSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  lpgSizes?: LpgSize[];
}

interface SaleLineItem {
  id: string;
  lpgSizeId: string;
  quantity: string;
  unitPrice: string;
}

export function EditSaleDialog({ open, onOpenChange, sale, lpgSizes }: EditSaleDialogProps) {
  const [customerId, setCustomerId] = React.useState("");
  const [saleType, setSaleType] = React.useState<"sale" | "exchange">("sale");
  const [items, setItems] = React.useState<SaleLineItem[]>([
    { id: '1', lpgSizeId: '', quantity: '1', unitPrice: '' }
  ]);

  const { data: customersResponse } = useCustomers();
  const { mutate: updateSale, isPending } = useUpdateSale();

  React.useEffect(() => {
    if (open && sale) {
      setCustomerId(sale.customer_id?.toString() || "none");
      setSaleType(sale.type);
      
      // Initialize items from sale_items
      if (sale.sales_items && sale.sales_items.length > 0) {
        const newItems = sale.sales_items.map((item, idx) => ({
          id: `item-${idx}`,
          lpgSizeId: item.lpg_size_id.toString(),
          quantity: item.quantity.toString(),
          unitPrice: item.unit_price.toString()
        }));
        setItems(newItems);
      }
    }
  }, [open, sale]);

  // Auto-refresh prices when customer changes
  React.useEffect(() => {
    const refreshPrices = async () => {
      const updatedItems = await Promise.all(items.map(async (item) => {
        if (!item.lpgSizeId) return item;
        
        let newPrice = item.unitPrice;
        
        if (customerId !== 'none') {
          try {
            const customerPrice = await getCustomerLpgPrice(Number(customerId), Number(item.lpgSizeId));
            if (customerPrice) {
              newPrice = customerPrice.price.toString();
            } else {
              // Fallback to standard price if no custom price
              const size = (lpgSizes || []).find(s => s.id.toString() === item.lpgSizeId);
              if (size) newPrice = size.price.toString();
            }
          } catch (error) {
            console.error("Failed to fetch customer price:", error);
          }
        } else {
          // Fallback to standard price for walk-in
          const size = (lpgSizes || []).find(s => s.id.toString() === item.lpgSizeId);
          if (size) newPrice = size.price.toString();
        }
        
        return { ...item, unitPrice: newPrice };
      }));
      
      setItems(updatedItems);
    };

    // Only refresh if the customer was changed AFTER initial load
    // To avoid overwriting existing sale item prices on first open
    if (open && customerId !== (sale?.customer_id?.toString() || "none")) {
        refreshPrices();
    }
  }, [customerId, open]);

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  // Add new line item
  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      lpgSizeId: '',
      quantity: '1',
      unitPrice: ''
    }]);
  };

  // Remove line item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Update item field
  const updateItem = async (id: string, field: keyof SaleLineItem, value: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });

    // Fetch customer price when size changes
    if (field === 'lpgSizeId' && customerId !== 'none') {
      try {
        const customerPrice = await getCustomerLpgPrice(Number(customerId), Number(value));
        if (customerPrice) {
          updatedItems[updatedItems.findIndex(i => i.id === id)].unitPrice = customerPrice.price.toString();
        }
      } catch (error) {
        console.error("Failed to fetch customer price:", error);
      }
    }

    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sale || items.some(item => !item.lpgSizeId || !item.quantity || !item.unitPrice)) return;

    const saleItems = items.map(item => ({
      lpg_size_id: Number(item.lpgSizeId),
      quantity: Number(item.quantity),
      unit_price: Number(item.unitPrice)
    }));

    updateSale(
      {
        id: sale.id,
        saleData: {
          customer_id: customerId !== "none" ? Number(customerId) : null,
          items: saleItems,
          total_price: totalPrice,
          type: saleType,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl">Edit Sale</DialogTitle>
            <DialogDescription className="text-sm">
              Modify products and sale details. Inventory changes will be reversed and reapplied.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Customer & Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Customer
                </Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger id="customer" className="h-9 border-border/50">
                    <SelectValue placeholder="Walk-in" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Walk-in (No Customer)</SelectItem>
                    {customersResponse?.data.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale-type" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sale Type
                </Label>
                <Select value={saleType} onValueChange={(value: "sale" | "exchange") => setSaleType(value)}>
                  <SelectTrigger id="sale-type" className="h-9 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale (No Exchange)</SelectItem>
                    <SelectItem value="exchange">Exchange (Plus Empty Tank)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Products</Label>
                  <p className="text-xs text-muted-foreground">Manage items in this sale</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2 border border-border/50 rounded-lg p-5 bg-card/30">
                {items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end pb-3 last:pb-0 border-b border-border/25 last:border-b-0">
                    {/* LPG Size */}
                    <div className="col-span-4 space-y-1">
                      <Label htmlFor={`size-${item.id}`} className="text-xs font-medium">Product</Label>
                      <Select 
                        value={item.lpgSizeId} 
                        onValueChange={(val) => updateItem(item.id, 'lpgSizeId', val)}
                      >
                        <SelectTrigger id={`size-${item.id}`} className="h-8 border-border/50 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {lpgSizes?.map((size) => (
                            <SelectItem key={size.id} value={size.id.toString()}>
                              {size.suppliers?.name ? `[${size.suppliers.name}] ` : ""}{size.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor={`qty-${item.id}`} className="text-xs font-medium">Qty</Label>
                      <Input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        className="h-8 border-border/50 text-xs"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-3 space-y-1">
                      <Label htmlFor={`price-${item.id}`} className="text-xs font-medium">Unit Price (₱)</Label>
                      <Input
                        id={`price-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-8 border-border/50 text-xs"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-3 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Price Display */}
            <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/2 p-4">
              <div className="flex justify-between items-end gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold tracking-tight text-primary">₱{totalPrice.toLocaleString()}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || items.some(i => !i.lpgSizeId || !i.quantity || !i.unitPrice) || totalPrice === 0} className="h-9 gap-2">
              {isPending && <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
