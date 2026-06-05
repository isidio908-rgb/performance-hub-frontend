import { api, ApiError } from "./client";
import { normalizeDashboardKpis } from "@/utils/dashboard";
import type { DashboardKpis } from "@/types";

// Backend V3.4: GET /dashboard/kpis é a fonte oficial para os KPIs principais.
// Em projetos pré-V3.4 caímos para GET /analytics/overview, que é o contrato
// validado em V3.3.1.
export const dashboardApi = {
  kpis: async (projectId?: string | null): Promise<DashboardKpis> => {
    try {
      const raw = await api.get<unknown>("/dashboard/kpis", {
        query: projectId ? { projectId } : undefined,
      });
      return normalizeDashboardKpis(raw);
    } catch (err) {
      // 404/405: endpoint não existe nesta versão; caímos para overview.
      if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
        if (!projectId) throw err;
        return dashboardApi.overview(projectId);
      }
      throw err;
    }
  },

  overview: async (projectId: string): Promise<DashboardKpis> => {
    const raw = await api.get<unknown>("/analytics/overview", {
      query: { projectId },
    });
    return normalizeDashboardKpis(raw);
  },
};
