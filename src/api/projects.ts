import { api } from "./client";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types";

type ListResponse = Project[] | { data: Project[] };

// Backend atual NÃO suporta filtro por clientId em /projects.
// Por isso list() retorna todos; o filtro acontece no frontend (useProjects).
export const projectsApi = {
  list: () => api.get<ListResponse>("/projects"),
  get: (id: string) => api.get<Project | { data: Project }>(`/projects/${id}`),
  create: (input: CreateProjectInput) => api.post<Project>("/projects", input),
  update: (id: string, input: UpdateProjectInput) => api.patch<Project>(`/projects/${id}`, input),
  remove: (id: string) => api.delete<void>(`/projects/${id}`),
};
