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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordManualAdjustment } from "@/services/transactions-service";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { LpgSize } from "@/types";

interface ManualAdjustmentDialogProps {
  lpgSizes: LpgSize[];
}

export function ManualAdjustmentDialog({ lpgSizes }: ManualAdjustmentDialogProps) {
  const [sizeId, setSizeId] = React.useState<string>("");
  const [stockType, setStockType] = React.useState<'full_count' | 'empty_count' | 'for_refill_count'>('full_count');
  const [quantity, setQuantity] = React.useState("");
  const [note, setNote] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeId || !quantity || !note) return;
    
    setIsLoading(true);
    try {
      await recordManualAdjustment({
        lpg_size_id: Number(sizeId),
        quantity: Number(quantity),
        target_column: stockType,
        note: note
      });
      
      setOpen(false);
      setSizeId("");
      setQuantity("");
      setNote("");
      router.refresh();
    } catch (error) {
      console.error("Failed to record adjustment:", error);
      alert("Error recording adjustment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 h-9">
          <RefreshCcw className="h-4 w-4" />
          Manual Adjustment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Manual Stock Adjustment</DialogTitle>
            <DialogDescription>
              Correct inventory counts for a specific LPG size. Use negative numbers to decrease stock.
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
              <Label htmlFor="stockType" className="text-right text-xs">
                Stock Type
              </Label>
              <div className="col-span-3">
                <Select 
                  onValueChange={(v: any) => setStockType(v)} 
                  value={stockType} 
                  required
                >
                  <SelectTrigger id="stockType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_count">Full Tanks</SelectItem>
                    <SelectItem value="empty_count">Empty Tanks</SelectItem>
                    <SelectItem value="for_refill_count">Out for Refill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="qty" className="text-right text-xs">
                Adjustment
              </Label>
              <Input
                id="qty"
                type="number"
                placeholder="e.g. 5 or -2"
                className="col-span-3"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="note" className="text-right text-xs pt-2">
                Reason
              </Label>
              <Textarea
                id="note"
                placeholder="Why is this adjustment being made?"
                className="col-span-3 h-20"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !sizeId || !quantity || !note}>
              {isLoading ? "Saving..." : "Apply Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
