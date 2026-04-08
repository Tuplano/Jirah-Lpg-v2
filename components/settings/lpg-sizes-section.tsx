"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LpgSize } from "@/types";
import { Pencil, Plus, Search, Trash2, MoreHorizontal, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateLpgSize, useUpdateLpgSize, useDeleteLpgSize } from "@/hooks/use-settings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface LpgSizesSectionProps {
  sizes: LpgSize[];
}

export function LpgSizesSection({ sizes }: LpgSizesSectionProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState<LpgSize | null>(null);
  const { mutate: deleteSize, isPending: isDeleting } = useDeleteLpgSize();

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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSize(size);
                            setEditDialogOpen(true);
                          }}
                          className="gap-2 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSize(size);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive gap-2 cursor-pointer focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Size</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Dialogs */}
      <EditSizeDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        size={selectedSize} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete LPG Size</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{selectedSize?.name}</span>? 
              This action cannot be undone and may fail if the size is linked to existing transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                if (selectedSize) {
                  deleteSize(selectedSize.id, {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      setSelectedSize(null);
                    }
                  });
                }
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSize(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} disabled={isPending} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSizeDialog({ open, onOpenChange, size }: { open: boolean; onOpenChange: (open: boolean) => void; size: LpgSize | null }) {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [kilos, setKilos] = React.useState("");
  const { mutate: updateSize, isPending } = useUpdateLpgSize();

  React.useEffect(() => {
    if (open && size) {
      setName(size.name);
      setPrice(size.price.toString());
      setKilos(size.size.toString());
    }
  }, [open, size]);

  if (!size) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateSize(
      { id: size.id, name, price: Number(price), size: Number(kilos) },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKilos(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={isPending} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
