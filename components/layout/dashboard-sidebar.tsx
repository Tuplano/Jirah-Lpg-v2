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
} from "lucide-react";
import { signOut } from "@/app/auth/actions";

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

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: History,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
