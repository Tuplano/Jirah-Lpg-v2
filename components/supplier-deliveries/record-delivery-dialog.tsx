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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base">Record Inbound Delivery</DialogTitle>
            <DialogDescription className="text-sm">
              Log new tanks received from a supplier.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Supplier *</Label>
                <Select value={supplierId} onValueChange={(val) => { setSupplierId(val); setItems([]); }} required>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">Transaction Type *</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)} required>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exchange" disabled={totalEmptyStock === 0}>
                      Exchange (Give Empties, Get Full) {totalEmptyStock === 0 && supplierId && "(No empties)"}
                    </SelectItem>
                    <SelectItem value="purchase">Purchase (Get Full only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Items Delivered *</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} disabled={!supplierId} className="h-7 text-xs">
                  <PackageOpen className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground bg-muted/20">
                  No items added yet.
                </div>
              ) : (
                <div className="border rounded-md divide-y overflow-hidden shadow-sm">
                  {items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted/10">
                      <div className="flex-1 w-full min-w-[200px]">
                        <Label className="text-xs mb-1 text-muted-foreground">LPG Size</Label>
                        <Select 
                          value={item.lpg_size_id.toString()} 
                          onValueChange={(val) => handleItemChange(index, "lpg_size_id", parseInt(val))}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             {lpgSizes.filter(s => {
                               const isCorrectSupplier = s.supplier_id === parseInt(supplierId);
                               if (!isCorrectSupplier) return false;
                               
                               // If exchange, only show items with empty stock
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
                                   <span className="ml-2 text-[10px] text-muted-foreground">
                                     (Stock: {invItem?.full_count || 0}F, {invItem?.empty_count || 0}E)
                                   </span>
                                 </SelectItem>
                               );
                             })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full sm:w-24">
                         <Label className="text-xs mb-1 text-muted-foreground">Qty</Label>
                         <Input 
                           type="number" min="1" required
                           className="h-8 text-sm"
                           value={item.quantity}
                           onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                         />
                      </div>
                      <div className="w-full sm:w-32">
                         <Label className="text-xs mb-1 text-muted-foreground">Dealer Price (₱)</Label>
                         <Input 
                           type="number" min="0" step="0.01" required
                           className="h-8 text-sm"
                           value={item.unit_price}
                           onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                         />
                      </div>
                      <div className="pt-5 flex justify-end w-full sm:w-auto">
                        <Button 
                          type="button" variant="ghost" size="icon" 
                          onClick={() => handleRemoveItem(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
               <div className="grid gap-2">
                <Label className="text-sm font-medium">Delivery Fee (₱)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)} required>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed (Updates Inventory)</SelectItem>
                    <SelectItem value="pending">Pending (Awaiting receiving)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
              <span className="font-semibold text-sm">Total Cost:</span>
              <span className="text-lg font-bold">₱{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea 
                placeholder="Optional details..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none min-h-[60px] text-sm"
              />
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || items.length === 0} size="sm">
              {isPending ? "Recording..." : "Record Delivery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
