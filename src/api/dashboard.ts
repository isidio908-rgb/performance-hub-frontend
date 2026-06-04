import { api } from "./client";
import type { DashboardKpis } from "@/types";

export const dashboardApi = {
  kpis: (projectId: string) =>
    api.get<DashboardKpis>(`/dashboard/kpis`, { query: { projectId } }),
};
