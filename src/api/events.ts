import { api } from "./client";
import type { AnalyticsEvent } from "@/types";

type ListResponse =
  | AnalyticsEvent[]
  | { data: AnalyticsEvent[] }
  | { data: AnalyticsEvent[]; meta?: unknown };

export const eventsApi = {
  list: (projectId: string) => api.get<ListResponse>("/analytics/events", { query: { projectId } }),
};

export function normalizeEvents(res: ListResponse | undefined): AnalyticsEvent[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}
