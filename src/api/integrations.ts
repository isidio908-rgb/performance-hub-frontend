import { api } from "./client";
import type { IntegrationHealth, IntegrationDelivery, PaginationMeta } from "@/types";

type Wrapped<T> = T | { data: T } | { items: T } | null | undefined;

export interface DeliveriesParams {
  projectId?: string;
  provider?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface DeliveriesResponse {
  items: IntegrationDelivery[];
  meta?: PaginationMeta;
}

function unwrapArray<T>(
  res: Wrapped<T[]> | { data: T[]; meta?: unknown } | { items: T[]; meta?: unknown },
): {
  items: T[];
  meta?: PaginationMeta;
} {
  if (!res) return { items: [] };
  if (Array.isArray(res)) return { items: res as T[] };
  if (typeof res === "object") {
    const r = res as Record<string, unknown>;
    const meta = (r.meta as PaginationMeta | undefined) ?? undefined;
    if (Array.isArray(r.data)) return { items: r.data as T[], meta };
    if (Array.isArray(r.items)) return { items: r.items as T[], meta };
  }
  return { items: [] };
}

export const integrationsApi = {
  health: async (projectId?: string): Promise<IntegrationHealth[]> => {
    const r = await api.get<Wrapped<IntegrationHealth[]>>("/integrations/health", {
      query: projectId ? { projectId } : undefined,
    });
    return unwrapArray<IntegrationHealth>(r).items;
  },
  deliveries: async (params: DeliveriesParams): Promise<DeliveriesResponse> => {
    const r = await api.get<unknown>("/integrations/deliveries", {
      query: {
        projectId: params.projectId,
        provider: params.provider,
        status: params.status,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
    return unwrapArray<IntegrationDelivery>(r as Wrapped<IntegrationDelivery[]>);
  },
  retryDelivery: (id: string) => api.post<unknown>(`/integrations/deliveries/${id}/retry`),
  processPending: (projectId?: string) =>
    api.post<unknown>("/integrations/process-pending", projectId ? { projectId } : undefined),
};
