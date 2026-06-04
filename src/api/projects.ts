import { api } from "./client";
import type { Project } from "@/types";

// Backend atual expõe GET /projects sem suporte a filtro por clientId.
// O filtro acontece no frontend (ver ClientProjectSelector).
export const projectsApi = {
  list: () => api.get<Project[] | { data: Project[] }>("/projects"),
};
