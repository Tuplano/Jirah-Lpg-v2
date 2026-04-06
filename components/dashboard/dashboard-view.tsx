"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ShoppingCart, RefreshCcw, TrendingUp, AlertCircle } from "lucide-react";
import {
  MotionCard,
  MotionPage,
  MotionProgress,
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
    { label: "Full", count: stats.totalFull, color: "bg-green-500" },
    { label: "Empty", count: stats.totalEmpty, color: "bg-blue-500" },
    { label: "For Refill", count: stats.totalRefill, color: "bg-amber-500" },
  ];

  return (
    <MotionPage className="space-y-8">
      <MotionSection className="flex flex-col gap-2">
        <span className="w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-red-700">
          Live Overview
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here&apos;s what&apos;s happening with your LPG inventory today.</p>
      </MotionSection>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MotionCard delay={0.05}>
          <Card className="cursor-default border-white/60 bg-white/90 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground">Total cylinders in the system</p>
            </CardContent>
          </Card>
        </MotionCard>

        <MotionCard delay={0.1}>
          <Card className="cursor-default border-green-100 bg-gradient-to-br from-green-50 via-white to-white shadow-sm backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-green-100/70 dark:border-green-900/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available (Full)</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalFull}</div>
              <p className="text-xs text-muted-foreground text-green-600/80">Ready for immediate sale</p>
            </CardContent>
          </Card>
        </MotionCard>

        <MotionCard delay={0.15}>
          <Card className="cursor-default border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white shadow-sm backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-amber-100/70 dark:border-amber-900/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Refill Cycle</CardTitle>
              <RefreshCcw className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.totalRefill}</div>
              <p className="text-xs text-muted-foreground text-amber-600/80">Currently at the plant</p>
            </CardContent>
          </Card>
        </MotionCard>

        <MotionCard delay={0.2}>
          <Card className="cursor-default border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white shadow-sm backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-blue-100/70 dark:border-blue-900/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Empty Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalEmpty}</div>
              <p className="text-xs text-muted-foreground text-blue-600/80">Waiting to be sent for refill</p>
            </CardContent>
          </Card>
        </MotionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <MotionSection className="lg:col-span-4" delay={0.25}>
          <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Overview of your sales today vs overall performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center justify-around py-4">
                 <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Today&apos;s Revenue</p>
                    <p className="text-3xl font-bold text-red-600">₱{stats.todayRevenue.toLocaleString()}</p>
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      {stats.todaySalesCount} units sold
                    </div>
                 </div>
                 <div className="invisible h-12 w-px bg-border md:visible" />
                 <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">₱{stats.totalSalesRevenue.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stats.totalSalesQuantity} total units sold
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </MotionSection>

        <MotionSection className="lg:col-span-3" delay={0.32}>
          <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Inventory Health</CardTitle>
              <CardDescription>Visual breakdown of current cylinder status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-4">
                 {stockBreakdown.map((item, index) => {
                   const percentage = totalStock > 0 ? (item.count / totalStock) * 100 : 0;

                   return (
                     <MotionSection key={item.label} className="space-y-1" delay={0.38 + index * 0.08}>
                       <div className="flex items-center justify-between text-sm">
                         <span className="font-medium">{item.label}</span>
                         <span className="text-muted-foreground">{item.count} units</span>
                       </div>
                       <MotionProgress className={item.color} value={percentage} />
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
