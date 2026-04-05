"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Package,
  History,
  Users,
  Settings,
  Flame,
  LogOut,
  ShoppingCart,
  RefreshCcw,
  Truck,
  ChevronRight,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


const navGroups = [
  {
    label: "Monitoring",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Inventory", url: "/inventory", icon: Package },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Sales", url: "/sales", icon: ShoppingCart },
      { title: "Refills", url: "/refills", icon: Truck },
      { title: "Adjustments", url: "/adjustments", icon: RefreshCcw },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Audit Log", url: "/transactions", icon: History },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <Flame className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-lg tracking-tight">JIRAH LPG</span>
            <span className="text-xs text-muted-foreground font-medium">Inventory v2</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-0.5">
        {navGroups.map((group) => {
          const isGroupActive = group.items.some(item => 
            item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
          );

          return (
            <Collapsible
              key={group.label}
              asChild
              defaultOpen={isGroupActive}
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between hover:text-foreground">
                    {group.label}
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                        
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                              <Link href={item.url}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>



      <div className="mt-auto p-4 border-t">
        <form action={signOut}>
          <SidebarMenuButton 
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            tooltip="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </SidebarMenuButton>
        </form>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
