"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.09),_transparent_36%),linear-gradient(180deg,rgba(248,250,252,0.95),rgba(248,250,252,0.72))]">
        <DashboardSidebar />
        <SidebarInset className="relative flex-1 overflow-hidden bg-transparent">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 right-[-5rem] h-56 w-56 rounded-full bg-red-500/10 blur-3xl"
            animate={{
              x: [0, -18, 0],
              y: [0, 16, 0],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <main className="relative p-4 md:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
