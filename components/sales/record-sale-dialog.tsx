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
import { recordSale } from "@/services/sales-service";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { LpgSize } from "@/types/inventory";

interface RecordSaleDialogProps {
  lpgSizes: LpgSize[];
}

export function RecordSaleDialog({ lpgSizes }: RecordSaleDialogProps) {
  const [sizeId, setSizeId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState("1");
  const [totalPrice, setTotalPrice] = React.useState("");
  const [type, setType] = React.useState<'sale' | 'exchange'>('sale');
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  // Auto-calculate total price based on selected size and quantity
  React.useEffect(() => {
    const selectedSize = lpgSizes.find(s => s.id.toString() === sizeId);
    if (selectedSize) {
      setTotalPrice((selectedSize.price * Number(quantity)).toString());
    }
  }, [sizeId, quantity, lpgSizes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeId) return;
    setIsLoading(true);
    try {
      await recordSale({
        lpg_size_id: Number(sizeId),
        quantity: Number(quantity),
        total_price: Number(totalPrice),
        type: type,
        note: `Sale: ${type}`
      });
      setOpen(false);
      setSizeId("");
      setQuantity("1");
      setTotalPrice("");
      router.refresh();
    } catch (error) {
      console.error("Failed to record sale:", error);
      alert("Error recording sale. Please check inventory stock.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
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
                    {lpgSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id.toString()}>
                        {size.name}
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
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading || !sizeId}>
              {isLoading ? "Saving..." : "Process Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
