import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  integrationConfigsApi,
  type CreateIntegrationConfigInput,
  type UpdateIntegrationConfigInput,
} from "@/api/integrationConfigs";

export const integrationConfigsKey = (projectId: string | null | undefined) =>
  ["integrations", "configs", projectId ?? null] as const;

export function useIntegrationConfigs(projectId: string | null | undefined) {
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: integrationConfigsKey(projectId),
    queryFn: () => integrationConfigsApi.list(projectId ?? undefined),
    enabled: !!projectId,
    retry: 0,
    staleTime: 15_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["integrations", "configs"] });

  const createConfig = useMutation({
    mutationFn: (input: CreateIntegrationConfigInput) => integrationConfigsApi.create(input),
    onSuccess: invalidate,
  });

  const updateConfig = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateIntegrationConfigInput }) =>
      integrationConfigsApi.update(id, input),
    onSuccess: invalidate,
  });

  const deleteConfig = useMutation({
    mutationFn: (id: string) => integrationConfigsApi.remove(id),
    onSuccess: invalidate,
  });

  return {
    listQuery,
    configs: listQuery.data ?? [],
    createConfig,
    updateConfig,
    deleteConfig,
  };
}
