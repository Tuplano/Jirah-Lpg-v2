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
import { useInventory } from "@/hooks/use-inventory";
import { useCustomers } from "@/hooks/use-customers";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { LpgSize } from "@/types";
import { getCustomerLpgPrice } from "@/services/customer-service";

interface RecordSaleDialogProps {
  lpgSizes?: LpgSize[];
}

interface SaleLineItem {
  id: string;
  lpgSizeId: string;
  quantity: string;
  unitPrice: string;
}

export function RecordSaleDialog({ lpgSizes: initialLpgSizes }: RecordSaleDialogProps) {
  const { data: lpgSizes } = useLpgSizes();
  const { data: inventory } = useInventory();
  const { data: customersResponse } = useCustomers();
  const [customerId, setCustomerId] = React.useState<string>("walk-in");
  const [type, setType] = React.useState<'sale' | 'exchange'>('exchange');
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<SaleLineItem[]>([
    { id: '1', lpgSizeId: '', quantity: '1', unitPrice: '' }
  ]);

  const { mutate: createSale, isPending } = useCreateSale();
  const normalizedCustomerId = customerId === "walk-in" ? undefined : Number(customerId);

  // Auto-refresh prices when customer changes
  React.useEffect(() => {
    const refreshPrices = async () => {
      const updatedItems = await Promise.all(items.map(async (item) => {
        if (!item.lpgSizeId) return item;
        
        let newPrice = item.unitPrice;
        
        if (customerId !== 'walk-in') {
          try {
            const customerPrice = await getCustomerLpgPrice(Number(customerId), Number(item.lpgSizeId));
            if (customerPrice) {
              newPrice = customerPrice.price.toString();
            } else {
              // Fallback to standard price if no custom price
              const size = (lpgSizes || initialLpgSizes || []).find(s => s.id.toString() === item.lpgSizeId);
              if (size) newPrice = size.price.toString();
            }
          } catch (error) {
            console.error("Failed to fetch customer price:", error);
          }
        } else {
          // Fallback to standard price for walk-in
          const size = (lpgSizes || initialLpgSizes || []).find(s => s.id.toString() === item.lpgSizeId);
          if (size) newPrice = size.price.toString();
        }
        
        return { ...item, unitPrice: newPrice };
      }));
      
      setItems(updatedItems);
    };

    if (open) refreshPrices();
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
    if (field === 'lpgSizeId' && customerId !== 'walk-in') {
      try {
        const customerPrice = await getCustomerLpgPrice(Number(customerId), Number(value));
        if (customerPrice) {
          updatedItems[updatedItems.findIndex(i => i.id === id)].unitPrice = customerPrice.price.toString();
        }
      } catch (error) {
        console.error("Failed to fetch customer price:", error);
      }
    }

    // Set default price if no customer price
    if (field === 'lpgSizeId' && customerId === 'walk-in') {
      const size = (lpgSizes || initialLpgSizes || []).find(s => s.id.toString() === value);
      if (size) {
        updatedItems[updatedItems.findIndex(i => i.id === id)].unitPrice = size.price.toString();
      }
    }

    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all items have required fields
    if (items.some(item => !item.lpgSizeId || !item.quantity || !item.unitPrice)) {
      return;
    }

    const saleItems = items.map(item => ({
      lpg_size_id: Number(item.lpgSizeId),
      quantity: Number(item.quantity),
      unit_price: Number(item.unitPrice)
    }));

    createSale({
      customer_id: normalizedCustomerId ?? null,
      items: saleItems,
      total_price: totalPrice,
      type: type,
      note: `Sale: ${type}`
    }, {
      onSuccess: () => {
        setOpen(false);
        setCustomerId("walk-in");
        setType('sale');
        setItems([
          { id: '1', lpgSizeId: '', quantity: '1', unitPrice: '' }
        ]);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-9">
          <ShoppingCart className="h-4 w-4" />
          Record Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="p-6 pb-2 space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="h-5 w-5" />
              <DialogTitle className="text-xl">Record Sale</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground/80">
              Add products to create a sale transaction. Inventory will update automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-8">
            {/* Header Form Section */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label htmlFor="customer" className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                  Customer Details
                </Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger id="customer" className="h-10 border-border/60 bg-background/50">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in / Default Price</SelectItem>
                    {(customersResponse?.data || []).map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="type" className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                  Transaction Type
                </Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger id="type" className="h-10 border-border/60 bg-background/50">
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
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <Label className="text-xs font-bold uppercase tracking-[0.1em] text-foreground">Line Items</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addItem}
                  className="h-8 text-[11px] font-semibold text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1.5" />
                  Add Product
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="group flex flex-col sm:flex-row items-end gap-3 p-4 rounded-lg bg-muted/20 border border-border/40 hover:border-border/80 transition-all duration-200">
                    {/* LPG Size */}
                    <div className="flex-[2] w-full space-y-1.5">
                      <Label htmlFor={`size-${item.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Product</Label>
                      <Select 
                        value={item.lpgSizeId} 
                        onValueChange={(val) => updateItem(item.id, 'lpgSizeId', val)}
                      >
                        <SelectTrigger id={`size-${item.id}`} className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {(lpgSizes || initialLpgSizes || []).filter(size => {
                            const stockItem = inventory?.find(inv => inv.lpg_size_id === size.id);
                            return stockItem && stockItem.full_count > 0;
                          }).map((size) => {
                            const stockItem = inventory?.find(inv => inv.lpg_size_id === size.id);
                            return (
                              <SelectItem key={size.id} value={size.id.toString()}>
                                {size.suppliers?.name ? `[${size.suppliers.name}] ` : ""}{size.name} 
                                <span className="ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                                  {stockItem?.full_count || 0} in stock
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity */}
                    <div className="w-full sm:w-24 space-y-1.5">
                      <Label htmlFor={`qty-${item.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Qty</Label>
                      <Input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1 text-center font-medium"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="w-full sm:w-32 space-y-1.5">
                      <Label htmlFor={`price-${item.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Unit Price (₱)</Label>
                      <Input
                        id={`price-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1 text-right font-medium pr-3"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                      />
                    </div>

                    {/* Line Total Display */}
                    <div className="w-full sm:w-32 space-y-1.5">
                      <Label className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Total</Label>
                      <div className="h-9 flex items-center justify-end px-3 rounded-md bg-background/50 border border-border/40 text-sm font-semibold text-primary">
                        ₱{(Number(item.quantity) * Number(item.unitPrice) || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="pb-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown / Footer Summary */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Total Amount Due</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-medium text-primary/60">₱</span>
                    <span className="text-3xl font-bold tracking-tight text-primary">
                      {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground/80 bg-background/50 px-4 py-2 rounded-full border border-border/40">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{items.length} Product{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-px h-3 bg-border/60" />
                  <span>{items.reduce((acc, current) => acc + Number(current.quantity || 0), 0)} Total Units</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border/40 gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 px-6 font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || items.some(i => !i.lpgSizeId || !i.unitPrice) || totalPrice === 0} className="h-10 px-8 font-bold gap-2 shadow-sm shadow-primary/20">
              {isPending ? (
                 <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {isPending ? "Processing..." : "Confirm & Record Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
