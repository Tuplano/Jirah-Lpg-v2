"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LpgSize } from "@/types/inventory";
import { createLpgSize, updateLpgSize } from "@/services/lpg-size-service";
import { Plus, Pencil } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";


interface SettingsViewProps {
  initialLpgSizes: LpgSize[];
}

export function SettingsView({ initialLpgSizes }: SettingsViewProps) {
  const [lpgSizes] = React.useState<LpgSize[]>(initialLpgSizes);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and LPG size catalog.</p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* LPG Size Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>LPG Size Catalog</CardTitle>
              <CardDescription>Define the LPG sizes and brands you support.</CardDescription>
            </div>
            <CreateSizeDialog />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lpgSizes.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-3 p-3 bg-muted/50 font-semibold text-sm">
                    <span>Size Name</span>
                    <span>Standard Price</span>
                    <span className="text-right">Actions</span>
                  </div>
                  <div className="divide-y">
                    {lpgSizes.map((size) => (
                      <div key={size.id} className="grid grid-cols-3 p-3 items-center text-sm">
                        <span className="font-medium">{size.name}</span>
                        <span>₱{size.price.toLocaleString()}</span>
                        <div className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground italic text-sm">
                  No LPG sizes defined yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Existing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>How you want to be alerted about stock levels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when any brand drops below 5 full cylinders.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Info</CardTitle>
            <CardDescription>Configure your shop details for reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid gap-2">
               <Label htmlFor="shop-name">Shop Name</Label>
               <Input 
                 id="shop-name" 
                 defaultValue="Jirah LPG Station"
               />
             </div>
             <Button className="bg-red-600 hover:bg-red-700">Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateSizeDialog() {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createLpgSize(name, Number(price));
      setOpen(false);
      setName("");
      setPrice("");
      router.refresh();
    } catch (error) {
      console.error("Failed to create LPG size:", error);
      alert("Error creating size. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-red-600 hover:bg-red-700 text-white border-none">
          <Plus className="h-4 w-4" />
          Add New Size
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Define New LPG Size</DialogTitle>
            <DialogDescription>
              Create a new LPG size/brand category in your catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. 11kg Petron"
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
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? "Creating..." : "Create Size"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

