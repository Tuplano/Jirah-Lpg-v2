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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useInitializeInventory } from "@/hooks/use-inventory";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { LpgSize } from "@/types/inventory";

interface AddSizeDialogProps {
  unmanagedSizes: LpgSize[];
}

export function AddSizeDialog({ unmanagedSizes }: AddSizeDialogProps) {
  const [sizeId, setSizeId] = React.useState<string>("");
  const [initialFull, setInitialFull] = React.useState("0");
  const [initialEmpty, setInitialEmpty] = React.useState("0");
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const { mutate: addSize, isPending } = useInitializeInventory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeId) return;

    addSize({
      sizeId: Number(sizeId),
      initialFull: Number(initialFull),
      initialEmpty: Number(initialEmpty)
    }, {
      onSuccess: () => {
        setOpen(false);
        setSizeId("");
        setInitialFull("0");
        setInitialEmpty("0");
      }
    });
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add to Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add to Active Stock</DialogTitle>
            <DialogDescription>
              Select an LPG size from your catalog to start tracking in your active inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right">
                Size
              </Label>
              <div className="col-span-3">
                <Select value={sizeId} onValueChange={setSizeId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a size..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unmanagedSizes.length > 0 ? (
                      unmanagedSizes.map((size) => (
                        <SelectItem key={size.id} value={size.id.toString()}>
                          {size.name} (₱{size.price})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        All sizes are already being tracked.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialFull" className="text-right">
                Initial Full
              </Label>
              <Input
                id="initialFull"
                type="number"
                className="col-span-3"
                value={initialFull}
                onChange={(e) => setInitialFull(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialEmpty" className="text-right">
                Initial Empty
              </Label>
              <Input
                id="initialEmpty"
                type="number"
                className="col-span-3"
                value={initialEmpty}
                onChange={(e) => setInitialEmpty(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !sizeId}>
              {isPending ? "Adding..." : "Add to Inventory"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
