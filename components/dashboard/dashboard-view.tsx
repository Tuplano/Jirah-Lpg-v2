import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_CYLINDERS, MOCK_TRANSACTIONS } from "@/constants/mock-data";
import { Package, ShoppingCart, RefreshCcw } from "lucide-react";

export function DashboardView() {
  const totalCylinders = MOCK_CYLINDERS.length;
  const fullCylinders = MOCK_CYLINDERS.filter(c => c.current_status === 'Full').length;
  const emptyCylinders = MOCK_CYLINDERS.filter(c => c.current_status === 'Empty').length;
  const salesToday = MOCK_TRANSACTIONS.filter(t => t.status === 'Completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Jirah. Here's what's happening with your inventory today in the unified system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-default">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCylinders}</div>
            <p className="text-xs text-muted-foreground">Cylinders across all brands</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-default">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Full Cylinders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fullCylinders}</div>
            <p className="text-xs text-muted-foreground">Ready for sale</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-default">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empty Cylinders</CardTitle>
            <RefreshCcw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emptyCylinders}</div>
            <p className="text-xs text-muted-foreground">Awaiting refill</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-default border-red-100 dark:border-red-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesToday}</div>
            <p className="text-xs text-muted-foreground">Transactions completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of your latest transactions and stock movements.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {MOCK_TRANSACTIONS.map((txn) => (
                <div key={txn.id} className="flex items-center gap-4">
                   <div className={`h-9 w-9 rounded-full flex items-center justify-center ${txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {txn.status === 'Completed' ? <ShoppingCart className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}
                   </div>
                   <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {txn.items.map((item: any) => `${item.qty}x ${item.brand} ${item.size}`).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.date).toLocaleDateString()} at {new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                   <div className="text-sm font-semibold">
                      +{txn.total_amount?.toLocaleString()} PHP
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Stock Health</CardTitle>
            <CardDescription>Brand-wise status of your LPG cylinders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {['Petron', 'Solane', 'Phoenix'].map(brand => {
                 const count = MOCK_CYLINDERS.filter(c => c.brand === brand).length;
                 const fullCount = MOCK_CYLINDERS.filter(c => c.brand === brand && c.current_status === 'Full').length;
                 const percentage = count > 0 ? (fullCount / count) * 100 : 0;
                 
                 return (
                   <div key={brand} className="space-y-1">
                     <div className="flex items-center justify-between text-sm">
                       <span className="font-medium">{brand}</span>
                       <span className="text-muted-foreground">{fullCount}/{count} Full</span>
                     </div>
                     <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                       <div 
                         className={`h-full ${percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                         style={{ width: `${percentage}%` }}
                       />
                     </div>
                   </div>
                 );
               })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
