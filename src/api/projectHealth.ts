import { api } from "./client";

export type ProjectHealthStatus = "HEALTHY" | "WARNING" | "ERROR" | "UNKNOWN" | string;

export interface ProjectHealth {
  status: ProjectHealthStatus;
  events24h?: number;
  revenue24h?: number;
}

type Wrapped<T> = T | { data: T } | null | undefined;

function unwrap<T>(res: Wrapped<T>): T | null {
  if (!res) return null;
  if (typeof res === "object" && res !== null && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (d && typeof d === "object") return d as T;
  }
  return res as T;
}

// GET /projects/:id/health
export const projectHealthApi = {
  get: async (projectId: string): Promise<ProjectHealth | null> => {
    const r = await api.get<Wrapped<ProjectHealth>>(`/projects/${projectId}/health`);
    return unwrap<ProjectHealth>(r);
  },
};
