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
import { useRecordReturned, useRecordSentBatch } from "@/hooks/use-refills";
import { RefreshCcw, ArrowUpRight, ArrowDownLeft, Plus, Trash2 } from "lucide-react";
import { LpgSize, RefillBatch } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecordRefillDialogProps {
  lpgSizes: LpgSize[];
  pendingRefills: RefillBatch[];
}

interface RefillProductRow {
  id: string;
  sizeId: string;
  quantity: string;
}

export function RecordRefillDialog({ lpgSizes, pendingRefills }: RecordRefillDialogProps) {
  const [mode, setMode] = React.useState<'send' | 'return'>('send');
  const [products, setProducts] = React.useState<RefillProductRow[]>([
    { id: crypto.randomUUID(), sizeId: "", quantity: "1" },
  ]);
  const [refillId, setRefillId] = React.useState<string>("");
  const [cost, setCost] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const { mutate: recordSentBatch, isPending: isSending } = useRecordSentBatch();
  const { mutate: recordReturned, isPending: isReturning } = useRecordReturned();

  const isPending = isSending || isReturning;
  const canSubmitSend = products.every((product) => product.sizeId && Number(product.quantity) > 0);

  const resetSendForm = () => {
    setProducts([{ id: crypto.randomUUID(), sizeId: "", quantity: "1" }]);
    setCost("");
  };

  const addProductRow = () => {
    setProducts((current) => [
      ...current,
      { id: crypto.randomUUID(), sizeId: "", quantity: "1" },
    ]);
  };

  const updateProductRow = (id: string, updates: Partial<Omit<RefillProductRow, "id">>) => {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, ...updates } : product))
    );
  };

  const removeProductRow = (id: string) => {
    setProducts((current) => {
      if (current.length === 1) {
        return [{ id: crypto.randomUUID(), sizeId: "", quantity: "1" }];
      }

      return current.filter((product) => product.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'send') {
      if (!canSubmitSend) return;
      recordSentBatch({
        items: products.map((product) => ({
          lpg_size_id: Number(product.sizeId),
          quantity: Number(product.quantity),
        })),
        cost: cost ? Number(cost) : 0,
        date_sent: new Date().toISOString()
      }, {
        onSuccess: () => {
          setOpen(false);
          resetSendForm();
        }
      });
    } else {
      if (!refillId) return;
      recordReturned({
        id: Number(refillId),
        dateReturned: new Date().toISOString(),
        cost: cost ? Number(cost) : undefined
      }, {
        onSuccess: () => {
          setOpen(false);
          setRefillId("");
          setCost("");
        }
      });
    }
  };

  React.useEffect(() => {
    if (!open) {
      setMode("send");
      resetSendForm();
      setRefillId("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refills
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Refills</DialogTitle>
            <DialogDescription>
              Send multiple LPG products in one refill batch or confirm returned refill items.
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

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="w-[140px]">Quantity</TableHead>
                        <TableHead className="w-[80px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Select
                              onValueChange={(value) => updateProductRow(product.id, { sizeId: value })}
                              value={product.sizeId}
                            >
                              <SelectTrigger>
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
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => updateProductRow(product.id, { quantity: e.target.value })}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProductRow(product.id)}
                              aria-label="Remove product row"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                            Batch #{r.id} ({(r.refill_batch_items || []).reduce((sum, item) => sum + item.quantity, 0)} units, Sent: {new Date(r.date_sent).toLocaleDateString()})
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
              disabled={isPending || (mode === 'send' ? !canSubmitSend : !refillId)}
            >
              {isPending ? "Saving..." : (mode === 'send' ? "Record Refills" : "Confirm Return")}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
