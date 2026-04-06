"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LpgSize } from "@/types/inventory";
import { Pencil, Plus, Search, Tag } from "lucide-react";
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
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LPG Sizes</h1>
          <p className="text-muted-foreground">Manage the LPG size catalog used across inventory, sales, and refills.</p>
        </div>
        <CreateSizeDialog />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by LPG size..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LPG Size</TableHead>
                  <TableHead>Standard Price</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSizes.length > 0 ? (
                  filteredSizes.map((size) => (
                    <TableRow key={size.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Tag className="h-4 w-4" />
                          </div>
                          <div className="font-medium">{size.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">₱{size.price.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(size.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <EditSizeDialog size={size} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No LPG sizes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function CreateSizeDialog() {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const { mutate: createSize, isPending } = useCreateLpgSize();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createSize(
      { name, price: Number(price) },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setPrice("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Size
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Define New LPG Size</DialogTitle>
            <DialogDescription>
              Create a new LPG size in your catalog. Numeric entries are automatically saved as kg.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Size
              </Label>
              <Input
                id="name"
                placeholder="e.g. 11 or 11kg"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (₱)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="1000"
                className="col-span-3"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Size"}
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
  const [open, setOpen] = React.useState(false);
  const { mutate: updateSize, isPending } = useUpdateLpgSize();

  React.useEffect(() => {
    if (!open) {
      setName(size.name);
      setPrice(size.price.toString());
    }
  }, [open, size.name, size.price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateSize(
      { id: size.id, name, price: Number(price) },
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit LPG Size</DialogTitle>
            <DialogDescription>
              Update the LPG size name and standard price used throughout the app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`edit-name-${size.id}`} className="text-right">
                Size
              </Label>
              <Input
                id={`edit-name-${size.id}`}
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`edit-price-${size.id}`} className="text-right">
                Price (₱)
              </Label>
              <Input
                id={`edit-price-${size.id}`}
                type="number"
                className="col-span-3"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
