"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  Flame,
  LogOut,
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
import { dashboardNavigation } from "./navigation";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader>
        <motion.div
          className="flex items-center gap-3 px-2 py-3"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Flame className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-tight">
            <span className="font-semibold text-sm">JIRAH LPG</span>
            <span className="text-xs text-muted-foreground">v2</span>
          </div>
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-0">
        {dashboardNavigation.map((group, groupIndex) => {
          const isGroupActive = group.items.some(item => 
            item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
          );

          return (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.04 * groupIndex }}
            >
              <Collapsible
                asChild
                defaultOpen={isGroupActive}
                className="group/collapsible"
              >
                <SidebarGroup className="py-0">
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors">
                      {group.label}
                      <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent className="pt-1">
                      <SidebarMenu className="gap-0.5">
                        {group.items.map((item) => {
                          const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                          
                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isActive}
                                className="text-sm transition-all duration-200 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm hover:bg-muted"
                              >
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
            </motion.div>
          );
        })}
      </SidebarContent>

      <motion.div
        className="border-t border-border/50 p-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <form action={signOut}>
          <SidebarMenuButton 
            className="h-9 w-full justify-start gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            tooltip="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden group-data-[collapsible=icon]:hidden md:inline">Sign Out</span>
          </SidebarMenuButton>
        </form>
      </motion.div>
      <SidebarRail />
    </Sidebar>
  );
}
