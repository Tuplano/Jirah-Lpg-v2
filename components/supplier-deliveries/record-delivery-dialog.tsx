"use client";

import * as React from "react";
import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { PackageOpen, Plus, Trash2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Supplier, LpgSize } from "@/types";
import { useRecordSupplierDelivery } from "@/hooks/use-suppliers";
import { useInventory } from "@/hooks/use-inventory";

interface RecordDeliveryDialogProps {
  suppliers: Supplier[];
  lpgSizes: LpgSize[];
}

interface DeliveryItem {
  lpg_size_id: number;
  quantity: number;
  unit_price: number;
}

export function RecordDeliveryDialog({ suppliers, lpgSizes }: RecordDeliveryDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [supplierId, setSupplierId] = React.useState<string>("");
  const [type, setType] = React.useState<'exchange' | 'purchase'>('exchange');
  const [status, setStatus] = React.useState<'pending' | 'completed'>('completed'); // Default to immediately received
  const [deliveryFee, setDeliveryFee] = React.useState<number>(0);
  const [note, setNote] = React.useState("");
  const [items, setItems] = React.useState<DeliveryItem[]>([]);
  const { data: inventory } = useInventory();

  const totalEmptyStock = React.useMemo(() => {
    if (!supplierId || !inventory) return 0;
    const supplierSizeIds = new Set(lpgSizes.filter(s => s.supplier_id === parseInt(supplierId)).map(s => s.id));
    return inventory
      .filter(inv => supplierSizeIds.has(inv.lpg_size_id))
      .reduce((sum, inv) => sum + (inv.empty_count || 0), 0);
  }, [supplierId, inventory, lpgSizes]);

  const { mutate: recordDelivery, isPending } = useRecordSupplierDelivery();

  // Switch to purchase if exchange is selected but no empties are available
  React.useEffect(() => {
    if (supplierId && totalEmptyStock === 0 && type === 'exchange') {
      setType('purchase');
    }
  }, [supplierId, totalEmptyStock, type]);

  const handleAddItem = () => {
    let availableSizes = lpgSizes.filter(s => s.supplier_id === parseInt(supplierId));
    
    // In exchange mode, only allow adding items that have empty stock
    if (type === 'exchange') {
      availableSizes = availableSizes.filter(s => {
        const invItem = inventory?.find(inv => inv.lpg_size_id === s.id);
        return invItem && invItem.empty_count > 0;
      });
    }

    if (availableSizes.length > 0) {
      setItems([...items, { lpg_size_id: availableSizes[0].id, quantity: 1, unit_price: availableSizes[0].price }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DeliveryItem, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-update price if size changes (optional heuristic)
    if (field === 'lpg_size_id') {
      const size = lpgSizes.find(s => s.id === value);
      if (size) {
        newItems[index].unit_price = size.price;
      }
    }
    
    setItems(newItems);
  };

  const computeItemsTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  };

  const totalCost = computeItemsTotal() + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

    recordDelivery({
      supplier_id: parseInt(supplierId),
      delivery_date: new Date().toISOString(),
      type,
      delivery_fee: deliveryFee,
      total_cost: totalCost,
      status,
      note,
      items
    }, {
      onSuccess: () => {
        setOpen(false);
        setSupplierId("");
        setType("exchange");
        setStatus("completed");
        setDeliveryFee(0);
        setNote("");
        setItems([]);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 h-9">
          <Plus className="h-4 w-4" />
          Record Delivery
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="p-6 pb-2 space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <PackageOpen className="h-5 w-5" />
              <DialogTitle className="text-xl">Record Supplier Delivery</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground/80">
              Log new tanks received from a supplier. Inventory will update automatically upon completion.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-8">
            {/* Header Form Section */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label htmlFor="supplier" className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                  Supplier
                </Label>
                <Select value={supplierId} onValueChange={(val) => { setSupplierId(val); setItems([]); }} required>
                  <SelectTrigger id="supplier" className="h-10 border-border/60 bg-background/50">
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="type" className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                  Transaction Type
                </Label>
                <Select value={type} onValueChange={(val: any) => setType(val)} required>
                  <SelectTrigger id="type" className="h-10 border-border/60 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exchange" disabled={totalEmptyStock === 0}>
                      Exchange (Give Empties, Get Full) {totalEmptyStock === 0 && supplierId && "• No empties"}
                    </SelectItem>
                    <SelectItem value="purchase">Purchase (Get Full Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <Label className="text-xs font-bold uppercase tracking-[0.1em] text-foreground">Delivered Items</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!supplierId}
                  onClick={handleAddItem}
                  className="h-8 text-[11px] font-semibold text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1.5" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-border/40 rounded-xl text-center bg-muted/5">
                    <PackageOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground/60 font-medium italic">No items added to this delivery yet.</p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="group flex flex-col sm:flex-row items-end gap-3 p-4 rounded-lg bg-muted/20 border border-border/40 hover:border-border/80 transition-all duration-200">
                      {/* LPG Size */}
                      <div className="flex-[2] w-full space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Product Size</Label>
                        <Select 
                          value={item.lpg_size_id.toString()} 
                          onValueChange={(val) => handleItemChange(index, "lpg_size_id", parseInt(val))}
                        >
                          <SelectTrigger className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             {lpgSizes.filter(s => {
                               const isCorrectSupplier = s.supplier_id === parseInt(supplierId);
                               if (!isCorrectSupplier) return false;
                               
                               if (type === 'exchange') {
                                 const invItem = inventory?.find(inv => inv.lpg_size_id === s.id);
                                 return invItem && invItem.empty_count > 0;
                               }
                               
                               return true;
                             }).map(size => {
                               const invItem = inventory?.find(inv => inv.lpg_size_id === size.id);
                               return (
                                 <SelectItem key={size.id} value={size.id.toString()}>
                                   {size.name}
                                   <span className="ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                                     Stock: {invItem?.full_count || 0}F, {invItem?.empty_count || 0}E
                                   </span>
                                 </SelectItem>
                               );
                             })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity */}
                      <div className="w-full sm:w-24 space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Qty</Label>
                        <Input 
                          type="number" min="1" required
                          className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1 text-center font-medium"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="w-full sm:w-32 space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Dealer Price (₱)</Label>
                        <Input 
                          type="number" min="0" step="0.01" required
                          className="h-9 border-border/60 bg-background shadow-xs transition-shadow focus:ring-1 text-right font-medium pr-3"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      {/* Line Total Display */}
                      <div className="w-full sm:w-32 space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-muted-foreground/70 ml-1">Subtotal</Label>
                        <div className="h-9 flex items-center justify-end px-3 rounded-md bg-background/50 border border-border/40 text-sm font-semibold text-primary">
                          ₱{(item.quantity * item.unit_price || 0).toLocaleString()}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="pb-0.5">
                        <Button 
                          type="button" variant="ghost" size="icon" 
                          onClick={() => handleRemoveItem(index)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
            </div>
          </div>
            {/* Price & Notes Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                    Delivery Status
                  </Label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)} required>
                    <SelectTrigger id="status" className="h-10 border-border/60 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed (Received)</SelectItem>
                      <SelectItem value="pending">Pending (Awaiting)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="delivery-fee" className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                    Delivery Fee (₱)
                  </Label>
                  <Input
                    id="delivery-fee"
                    type="number" min="0" step="0.01"
                    className="h-10 border-border/60 bg-background/50 font-medium"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="note" className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                  Notes / Reference
                </Label>
                <Textarea 
                  id="note"
                  placeholder="PO # or other details..." 
                  className="resize-none min-h-[94px] border-border/60 bg-background/50 text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Total Display */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Total Cost Payable</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-medium text-primary/60">₱</span>
                    <span className="text-3xl font-bold tracking-tight text-primary">
                      {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground/80 bg-background/50 px-4 py-2 rounded-full border border-border/40">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{items.length} Line Item{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-px h-3 bg-border/60" />
                  <span>{items.reduce((acc, current) => acc + Number(current.quantity || 0), 0)} Total Tanks</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border/40 gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending} className="h-10 px-6 font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || items.length === 0} className="h-10 px-8 font-bold gap-2 shadow-sm shadow-primary/20">
              {isPending ? (
                 <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isPending ? "Processing..." : "Record Delivery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
