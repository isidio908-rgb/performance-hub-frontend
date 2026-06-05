import { api } from "./client";

export type IntegrationConfigProvider =
  | "META_PIXEL"
  | "GOOGLE_ADS"
  | "GA4"
  | "WEBHOOK"
  | "CUSTOM"
  | string;

export interface IntegrationConfig {
  id: string;
  projectId: string;
  provider: IntegrationConfigProvider;
  name?: string;
  status?: string;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIntegrationConfigInput {
  projectId: string;
  provider: IntegrationConfigProvider;
  name?: string;
  status?: string;
  config?: Record<string, unknown>;
}

export type UpdateIntegrationConfigInput = Partial<Omit<CreateIntegrationConfigInput, "projectId">>;

type Wrapped<T> = T | { data: T } | { items: T } | null | undefined;

function unwrapArray<T>(res: Wrapped<T[]>): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (typeof res === "object") {
    const r = res as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data as T[];
    if (Array.isArray(r.items)) return r.items as T[];
  }
  return [];
}

function unwrapObject<T>(res: Wrapped<T>): T | null {
  if (!res) return null;
  if (typeof res === "object" && res !== null && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (d && typeof d === "object") return d as T;
  }
  return res as T;
}

// CRUD /integrations/configs (V3.4.2)
export const integrationConfigsApi = {
  list: async (projectId?: string): Promise<IntegrationConfig[]> => {
    const r = await api.get<Wrapped<IntegrationConfig[]>>("/integrations/configs", {
      query: projectId ? { projectId } : undefined,
    });
    return unwrapArray<IntegrationConfig>(r);
  },
  create: async (input: CreateIntegrationConfigInput): Promise<IntegrationConfig | null> => {
    const r = await api.post<Wrapped<IntegrationConfig>>("/integrations/configs", input);
    return unwrapObject<IntegrationConfig>(r);
  },
  update: async (
    id: string,
    input: UpdateIntegrationConfigInput,
  ): Promise<IntegrationConfig | null> => {
    const r = await api.patch<Wrapped<IntegrationConfig>>(`/integrations/configs/${id}`, input);
    return unwrapObject<IntegrationConfig>(r);
  },
  remove: (id: string) => api.delete<unknown>(`/integrations/configs/${id}`),
};
