import { useQuery } from "@tanstack/react-query";
import { projectHealthApi } from "@/api/projectHealth";

export const projectHealthKey = (projectId: string | null | undefined) =>
  ["project", "health", projectId] as const;

export function useProjectHealth(projectId: string | null | undefined) {
  return useQuery({
    queryKey: projectHealthKey(projectId),
    queryFn: () => projectHealthApi.get(projectId!),
    enabled: !!projectId,
    retry: 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
