import { api } from "./client";
import type { AnalyticsEvent, PaginatedResponse } from "@/types";

export interface EventsQueryParams {
  projectId: string;
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  search?: string;
}

export const eventsApi = {
  list: (params: EventsQueryParams) =>
    api.get<PaginatedResponse<AnalyticsEvent>>("/analytics/events", {
      query: {
        projectId: params.projectId,
        page: params.page,
        pageSize: params.pageSize,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        type: params.type,
        search: params.search,
      },
    }),
};

export function normalizeEvents(
  res: PaginatedResponse<AnalyticsEvent> | undefined | null,
): AnalyticsEvent[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if ("data" in res && Array.isArray(res.data)) return res.data;
  if ("items" in res && Array.isArray(res.items)) return res.items;
  return [];
}
