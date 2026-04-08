"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LpgSize } from "@/types";
import { Pencil, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateLpgSize, useUpdateLpgSize } from "@/hooks/use-settings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LpgSizesSectionProps {
  sizes: LpgSize[];
}

export function LpgSizesSection({ sizes }: LpgSizesSectionProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSizes = sizes.filter((size) =>
    size.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">LPG Catalog</h2>
        <CreateSizeDialog />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="Search LPG size..."
          className="pl-9 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50">
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Size</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Kilos</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Price</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-[0.08em]">Added</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-[0.08em]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {filteredSizes.length > 0 ? (
              filteredSizes.map((size) => (
                <TableRow key={size.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary text-xs font-semibold">
                        {size.size}
                      </div>
                      <span className="font-medium">{size.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{size.size} kg</TableCell>
                  <TableCell className="font-medium text-sm">₱{size.price.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(size.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <EditSizeDialog size={size} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                  No LPG sizes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function CreateSizeDialog() {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [size, setSize] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const { mutate: createSize, isPending } = useCreateLpgSize();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createSize(
      { name, price: Number(price), size: Number(size) },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setPrice("");
          setSize("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 h-9">
          <Plus className="h-4 w-4" />
          Add Size
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base">New LPG Size</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new LPG size to your catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Size Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. 11kg or Mini"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size" className="text-sm font-medium">
                Kilos *
              </Label>
              <Input
                id="size"
                type="number"
                min="0"
                step="0.01"
                placeholder="11"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price (₱) *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSizeDialog({ size }: { size: LpgSize }) {
  const [name, setName] = React.useState(size.name);
  const [price, setPrice] = React.useState(size.price.toString());
  const [kilos, setKilos] = React.useState(size.size.toString());
  const [open, setOpen] = React.useState(false);
  const { mutate: updateSize, isPending } = useUpdateLpgSize();

  React.useEffect(() => {
    if (!open) {
      setName(size.name);
      setPrice(size.price.toString());
      setKilos(size.size.toString());
    }
  }, [open, size.name, size.price, size.size]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateSize(
      { id: size.id, name, price: Number(price), size: Number(kilos) },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base">Edit LPG Size</DialogTitle>
            <DialogDescription className="text-sm">
              Update size details and pricing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={`edit-name-${size.id}`} className="text-sm font-medium">
                Size Name
              </Label>
              <Input
                id={`edit-name-${size.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-size-${size.id}`} className="text-sm font-medium">
                Kilos
              </Label>
              <Input
                id={`edit-size-${size.id}`}
                type="number"
                min="0"
                step="0.01"
                value={kilos}
                onChange={(e) => setKilos(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-price-${size.id}`} className="text-sm font-medium">
                Price (₱)
              </Label>
              <Input
                id={`edit-price-${size.id}`}
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
