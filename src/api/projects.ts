import { api } from "./client";
import type { Project } from "@/types";

export const projectsApi = {
  list: (clientId?: string) =>
    api.get<Project[] | { data: Project[] }>("/projects", {
      query: clientId ? { clientId } : undefined,
    }),
};
