import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventsApi, normalizeEvents } from "@/api/events";
import { normalizePaginatedResponse, hasServerMeta } from "@/utils/pagination";
import type { AnalyticsEvent } from "@/types";

export interface UseEventsOptions {
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  search?: string;
}

export function useEvents(projectId: string | null | undefined, opts: UseEventsOptions = {}) {
  const query = useQuery({
    queryKey: [
      "analytics",
      "events",
      projectId,
      opts.page ?? null,
      opts.pageSize ?? null,
      opts.dateFrom ?? null,
      opts.dateTo ?? null,
      opts.type ?? null,
      opts.search ?? null,
    ],
    queryFn: () =>
      eventsApi.list({
        projectId: projectId!,
        page: opts.page,
        pageSize: opts.pageSize,
        dateFrom: opts.dateFrom,
        dateTo: opts.dateTo,
        type: opts.type,
        search: opts.search,
      }),
    enabled: !!projectId,
    retry: 1,
  });

  const normalized = useMemo(
    () => normalizePaginatedResponse<AnalyticsEvent>(query.data),
    [query.data],
  );

  // Backward compat: array of events
  const events = useMemo(() => normalizeEvents(query.data ?? undefined), [query.data]);

  return {
    query,
    events,
    meta: normalized.meta,
    isServerPaginated: hasServerMeta(normalized.meta),
    raw: query.data,
  };
}
