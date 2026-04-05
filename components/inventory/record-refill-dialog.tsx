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
import { refillService } from "@/services/refill-service";
import { RefreshCcw, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { LpgSize, Refill } from "@/types/inventory";

interface RecordRefillDialogProps {
  lpgSizes: LpgSize[];
  pendingRefills: Refill[];
}

export function RecordRefillDialog({ lpgSizes, pendingRefills }: RecordRefillDialogProps) {
  const [mode, setMode] = React.useState<'send' | 'return'>('send');
  const [sizeId, setSizeId] = React.useState<string>("");
  const [refillId, setRefillId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState("1");
  const [cost, setCost] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'send') {
        if (!sizeId) return;
        await refillService.recordSent({
          lpg_size_id: Number(sizeId),
          quantity: Number(quantity),
          cost: cost ? Number(cost) : 0,
          date_sent: new Date().toISOString()
        });
      } else {
        if (!refillId) return;
        await refillService.recordReturned(
          Number(refillId),
          new Date().toISOString(),
          cost ? Number(cost) : undefined
        );
      }
      setOpen(false);
      setSizeId("");
      setRefillId("");
      setQuantity("1");
      setCost("");
      router.refresh();
    } catch (error) {
      console.error("Failed to record refill:", error);
      alert("Error recording refill. Please check inventory stock.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refill Operations
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Refill Operations</DialogTitle>
            <DialogDescription>
              Manage cylinder refills. Select "Send" to record tanks sent for refill, or "Return" to record tanks back from the plant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-2 mb-2">
                <Button 
                  type="button" 
                  variant={mode === 'send' ? 'default' : 'outline'} 
                  onClick={() => setMode('send')}
                  className="gap-2"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Send for Refill
                </Button>
                <Button 
                  type="button" 
                  variant={mode === 'return' ? 'default' : 'outline'} 
                  onClick={() => setMode('return')}
                  className="gap-2"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Return Full
                </Button>
             </div>

            {mode === 'send' ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="size" className="text-right text-xs">Size</Label>
                  <div className="col-span-3">
                    <Select onValueChange={setSizeId} value={sizeId}>
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
                  <Label htmlFor="qty" className="text-right text-xs">Quantity</Label>
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    className="col-span-3"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refill" className="text-right text-xs">Pending</Label>
                <div className="col-span-3">
                  <Select onValueChange={setRefillId} value={refillId}>
                    <SelectTrigger id="refill">
                      <SelectValue placeholder="Select pending refill" />
                    </SelectTrigger>
                    <SelectContent>
                      {pendingRefills.length > 0 ? (
                        pendingRefills.map((r) => (
                          <SelectItem key={r.id} value={r.id.toString()}>
                            {r.quantity}x {r.lpg_sizes?.name} (Sent: {new Date(r.date_sent).toLocaleDateString()})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-xs text-muted-foreground text-center">
                          No pending refills found.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right text-xs">Cost (Optional)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="0"
                className="col-span-3"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className={mode === 'send' ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}
              disabled={isLoading || (mode === 'send' ? !sizeId : !refillId)}
            >
              {isLoading ? "Saving..." : (mode === 'send' ? "Record Shipment" : "Confirm Return")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
