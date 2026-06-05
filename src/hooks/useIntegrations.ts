import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { integrationsApi, type DeliveriesParams } from "@/api/integrations";
import { ApiError } from "@/api/client";

export function useIntegrationHealth(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["integrations", "health", projectId ?? null],
    queryFn: () => integrationsApi.health(projectId ?? undefined),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useIntegrationDeliveries(params: DeliveriesParams) {
  const query = useQuery({
    queryKey: [
      "integrations",
      "deliveries",
      params.projectId ?? null,
      params.provider ?? null,
      params.status ?? null,
      params.page ?? 1,
      params.pageSize ?? 20,
    ],
    queryFn: () => integrationsApi.deliveries(params),
    enabled: !!params.projectId,
    staleTime: 15_000,
    retry: 1,
  });

  const meta = query.data?.meta;
  const isServerPaginated =
    !!meta &&
    (typeof meta.total === "number" ||
      (typeof meta.page === "number" && typeof meta.pageSize === "number"));

  return {
    ...query,
    deliveries: query.data?.items ?? [],
    meta,
    isServerPaginated,
  };
}

export function useRetryDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => integrationsApi.retryDelivery(id),
    onSuccess: () => {
      toast.success("Reenvio agendado");
      qc.invalidateQueries({ queryKey: ["integrations", "deliveries"] });
      qc.invalidateQueries({ queryKey: ["integrations", "health"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : "Falha ao reenviar";
      toast.error(msg);
    },
  });
}

export function useProcessPending() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId?: string) => integrationsApi.processPending(projectId),
    onSuccess: () => {
      toast.success("Processamento de pendentes iniciado");
      qc.invalidateQueries({ queryKey: ["integrations", "deliveries"] });
      qc.invalidateQueries({ queryKey: ["integrations", "health"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : "Falha ao processar pendentes";
      toast.error(msg);
    },
  });
}
