"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function SettingsView() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and business information in the unified system.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Pending Transactions</Label>
                <p className="text-sm text-muted-foreground">Get reminded of open/pending orders.</p>
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
               <input 
                 id="shop-name" 
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
