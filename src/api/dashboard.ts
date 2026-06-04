import { api } from "./client";
import { normalizeDashboardKpis } from "@/utils/dashboard";
import type { DashboardKpis } from "@/types";

// Endpoint oficial validado no backend V3.3.1.
// Caso exista alias /dashboard/kpis em alguma versão, mantemos o oficial aqui:
// GET /analytics/overview?projectId=:projectId
export const dashboardApi = {
  overview: async (projectId: string): Promise<DashboardKpis> => {
    const raw = await api.get<unknown>("/analytics/overview", {
      query: { projectId },
    });
    return normalizeDashboardKpis(raw);
  },
};
