import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types";

function normalize(res: Project[] | { data: Project[] } | undefined): Project[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export function useProjects() {
  const qc = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list(),
  });

  const projects = useMemo(() => normalize(projectsQuery.data), [projectsQuery.data]);

  const getProjectsByClient = (clientId: string | null | undefined) =>
    clientId ? projects.filter((p) => p.clientId === clientId) : [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["projects"] });
    qc.invalidateQueries({ queryKey: ["analytics"] });
    qc.invalidateQueries({ queryKey: ["dashboard", "kpis"] });
    qc.invalidateQueries({ queryKey: ["app", "bootstrap"] });
    qc.invalidateQueries({ queryKey: ["onboarding", "status"] });
  };

  const createProject = useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: invalidate,
  });

  const updateProject = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsApi.update(id, input),
    onSuccess: invalidate,
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: invalidate,
  });

  return {
    projectsQuery,
    projects,
    getProjectsByClient,
    createProject,
    updateProject,
    deleteProject,
  };
}
