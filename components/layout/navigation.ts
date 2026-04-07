import {
  History,
  LayoutDashboard,
  Package,
  RefreshCcw,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const dashboardNavigation: NavigationGroup[] = [
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
    items: [{ title: "LPG Sizes", url: "/settings", icon: Settings }],
  },
];
