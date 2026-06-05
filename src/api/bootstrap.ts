import { api } from "./client";
import type { User, Client, Project } from "@/types";

export interface AppBootstrapResponse {
  user: User;
  clients: Client[];
  projects: Project[];
}

// GET /app/bootstrap — fonte agregada para layout/header/onboarding.
// Não substitui /me como validação de sessão (ver AuthProvider).
export const bootstrapApi = {
  get: () => api.get<AppBootstrapResponse>("/app/bootstrap"),
};
