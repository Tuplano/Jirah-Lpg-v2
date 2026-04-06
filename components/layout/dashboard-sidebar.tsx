"use client";

import * as React from "react";
import { motion } from "motion/react";
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
        <motion.div
          className="flex items-center gap-2 px-2 py-4"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg shadow-red-500/20"
            whileHover={{ rotate: -8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
          >
            <Flame className="h-5 w-5" />
          </motion.div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-lg tracking-tight">JIRAH LPG</span>
            <span className="text-xs text-muted-foreground font-medium">Inventory v2</span>
          </div>
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-0.5">
        {navGroups.map((group, groupIndex) => {
          const isGroupActive = group.items.some(item => 
            item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
          );

          return (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: 0.06 * groupIndex }}
            >
              <Collapsible
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
                              <motion.div
                                whileHover={{ x: 4 }}
                                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                              >
                                <SidebarMenuButton
                                  asChild
                                  tooltip={item.title}
                                  isActive={isActive}
                                  className="transition-all duration-300 data-[active=true]:bg-red-500/10 data-[active=true]:text-red-700 data-[active=true]:shadow-sm"
                                >
                                  <Link href={item.url}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </motion.div>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            </motion.div>
          );
        })}
      </SidebarContent>



      <motion.div
        className="mt-auto border-t p-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <form action={signOut}>
          <SidebarMenuButton 
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            tooltip="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </SidebarMenuButton>
        </form>
      </motion.div>
      <SidebarRail />
    </Sidebar>
  );
}
