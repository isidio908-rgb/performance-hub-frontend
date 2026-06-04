import { api } from "./client";
import type { Lead } from "@/types";

type ListResponse =
  | Lead[]
  | { data: Lead[] }
  | { data: Lead[]; meta?: unknown }
  | { items: Lead[] };

export const leadsApi = {
  list: (projectId: string) => api.get<ListResponse>("/analytics/leads", { query: { projectId } }),
};

export function normalizeLeads(res: ListResponse | undefined): Lead[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if ("data" in res && Array.isArray(res.data)) return res.data;
  if ("items" in res && Array.isArray(res.items)) return res.items;
  return [];
}
