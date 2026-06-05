import { api } from "./client";

export interface SystemHealthResponse {
  status?: string;
  uptime?: number;
  version?: string;
  [k: string]: unknown;
}

// GET /health — endpoint público de saúde do backend. Sem auth.
export const systemApi = {
  health: () => api.get<SystemHealthResponse>("/health", { auth: false }),
};
