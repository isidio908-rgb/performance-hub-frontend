import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { installApi } from "@/api/install";
import { BOOTSTRAP_QUERY_KEY } from "./useBootstrap";

export const installInfoKey = (projectId: string | null | undefined) =>
  ["install", "info", projectId] as const;

export function useProjectInstall(projectId: string | null | undefined) {
  return useQuery({
    queryKey: installInfoKey(projectId),
    queryFn: () => installApi.info(projectId!),
    enabled: !!projectId,
    retry: 0,
    staleTime: 15_000,
  });
}

export function useSendTestEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => installApi.sendTestEvent(projectId),
    onSuccess: (_data, projectId) => {
      qc.invalidateQueries({ queryKey: installInfoKey(projectId) });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "kpis"] });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["onboarding", "status"] });
      qc.invalidateQueries({ queryKey: ["project", "health", projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: BOOTSTRAP_QUERY_KEY });
    },
  });
}
