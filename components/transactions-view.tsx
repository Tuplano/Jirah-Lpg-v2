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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_TRANSACTIONS } from "@/constants/mock-data";
import { ShoppingCart, Search, Filter, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function TransactionsView() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredTransactions = MOCK_TRANSACTIONS.filter((t) =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Historical records of sales, refills, and movements in the unified structure.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <ShoppingCart className="h-4 w-4" />
          Record New Sale
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Transaction ID..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((txn) => {
              const mainType = txn.items[0]?.type;
              const isSale = mainType === 'Full Out' || mainType === 'Empty In';
              
              return (
                <TableRow key={txn.id}>
                  <TableCell className="font-medium text-xs tracking-wider">{txn.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{new Date(txn.date).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {txn.items.map((item: any) => `${item.qty}x ${item.brand} ${item.size}`).join(', ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isSale ? (
                         <div className="h-6 w-6 rounded bg-green-100 flex items-center justify-center text-green-700">
                            <ArrowUpRight className="h-3 w-3" />
                         </div>
                      ) : (
                        <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center text-blue-700">
                           <ArrowDownLeft className="h-3 w-3" />
                        </div>
                      )}
                      <span className="text-sm font-medium">{isSale ? 'Sale' : 'Movement'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {txn.total_amount?.toLocaleString()} PHP
                  </TableCell>
                  <TableCell>
                    <Badge variant={txn.status === 'Completed' ? 'secondary' : 'outline'} className={txn.status === 'Completed' ? 'bg-zinc-100 text-zinc-900' : ''}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
