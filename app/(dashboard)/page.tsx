import { DashboardView } from "@/components/dashboard/dashboard-view";
import { dashboardService } from "@/services/dashboard-service";

export default async function DashboardPage() {
  const stats = await dashboardService.getStats();
  
  return <DashboardView stats={stats} />;
}
