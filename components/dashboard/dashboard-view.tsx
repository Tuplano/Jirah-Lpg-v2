"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ShoppingCart, RefreshCcw, AlertCircle } from "lucide-react";
import {
  MotionCard,
  MotionPage,
  MotionSection,
} from "@/components/motion/dashboard-motion";

interface DashboardViewProps {
  stats: {
    totalSalesQuantity: number;
    totalSalesRevenue: number;
    totalFull: number;
    totalEmpty: number;
    totalRefill: number;
    todaySalesCount: number;
    todayRevenue: number;
  };
}

export function DashboardView({ stats }: DashboardViewProps) {
  const totalStock = stats.totalFull + stats.totalEmpty + stats.totalRefill;
  const stockBreakdown = [
    { label: "Full", count: stats.totalFull, icon: ShoppingCart, color: "text-primary" },
    { label: "Empty", count: stats.totalEmpty, icon: AlertCircle, color: "text-destructive" },
    { label: "For Refill", count: stats.totalRefill, icon: RefreshCcw, color: "text-accent" },
  ];

  return (
    <MotionPage className="space-y-8">
      <MotionSection className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here&apos;s your LPG inventory overview.</p>
      </MotionSection>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MotionCard delay={0.05}>
          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground mt-1">Cylinders in system</p>
            </CardContent>
          </Card>
        </MotionCard>

        <MotionCard delay={0.1}>
          <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
              <ShoppingCart className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalFull}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for sale</p>
            </CardContent>
          </Card>
        </MotionCard>

        <MotionCard delay={0.15}>
          <Card className="border border-accent/20 bg-gradient-to-br from-accent/5 to-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Refill Cycle</CardTitle>
              <RefreshCcw className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.totalRefill}</div>
              <p className="text-xs text-muted-foreground mt-1">At the plant</p>
            </CardContent>
          </Card>
        </MotionCard>

        <MotionCard delay={0.2}>
          <Card className="border border-destructive/20 bg-gradient-to-br from-destructive/5 to-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Empty</CardTitle>
              <AlertCircle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.totalEmpty}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting refill</p>
            </CardContent>
          </Card>
        </MotionCard>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <MotionSection className="lg:col-span-4" delay={0.25}>
          <Card className="border border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Sales Performance</CardTitle>
              <CardDescription>Today vs. lifetime metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">Today&apos;s Sales</p>
                  <p className="text-2xl font-bold">₱{stats.todayRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{stats.todaySalesCount} units sold</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">All Time</p>
                  <p className="text-2xl font-bold">₱{stats.totalSalesRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{stats.totalSalesQuantity} units total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionSection>

        <MotionSection className="lg:col-span-3" delay={0.32}>
          <Card className="border border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Stock Breakdown</CardTitle>
              <CardDescription>Current inventory status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                {stockBreakdown.map((item, index) => {
                  const percentage = totalStock > 0 ? (item.count / totalStock) * 100 : 0;
                  const Icon = item.icon;

                  return (
                    <MotionSection key={item.label} className="space-y-2" delay={0.38 + index * 0.06}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                          <span className="text-sm font-medium truncate">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground flex-shrink-0">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.label === 'Full' ? 'bg-primary' : 
                            item.label === 'Empty' ? 'bg-destructive' : 
                            'bg-accent'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </MotionSection>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </MotionSection>
      </div>
    </MotionPage>
  );
}
