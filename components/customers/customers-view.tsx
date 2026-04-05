"use client";

import * as React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types/inventory";
import { Users, Search, Plus, Phone, MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useCustomers } from "@/hooks/use-customers";
import { Skeleton } from "@/components/ui/skeleton";
import { AddCustomerDialog } from "./add-customer-dialog";

interface CustomersViewProps {
  initialCustomers: Customer[];
}

export function CustomersView({ initialCustomers }: CustomersViewProps) {
  const { data: customers, isLoading } = useCustomers();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredCustomers = (customers || initialCustomers).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !initialCustomers) {
     return <div className="p-8 text-center text-muted-foreground">Loading customers...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer database and track their transaction history.</p>
        </div>
        <AddCustomerDialog />
      </div>



      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or address..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="group relative rounded-lg border bg-card p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-muted group-hover:border-red-500/20 transition-colors">
                  <AvatarFallback className="bg-red-50 text-red-600 font-bold">
                    {customer.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{customer.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{customer.contact}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-dashed">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500/50" />
                <span>{customer.address}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">View History</Button>
              <Button variant="outline" size="sm" className="flex-1 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200 transition-colors">Edit</Button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No customers found</h3>
          <p className="text-muted-foreground">Try adjusting your search or add a new customer.</p>
        </div>
      )}
    </div>
  );
}
