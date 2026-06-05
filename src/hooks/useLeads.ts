import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { leadsApi, normalizeLeads } from "@/api/leads";
import { normalizePaginatedResponse, hasServerMeta } from "@/utils/pagination";
import type { Lead } from "@/types";

export interface UseLeadsOptions {
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  status?: string;
  utmSource?: string;
  utmCampaign?: string;
}

export function useLeads(projectId: string | null | undefined, opts: UseLeadsOptions = {}) {
  const query = useQuery({
    queryKey: [
      "analytics",
      "leads",
      projectId,
      opts.page ?? null,
      opts.pageSize ?? null,
      opts.dateFrom ?? null,
      opts.dateTo ?? null,
      opts.search ?? null,
      opts.status ?? null,
      opts.utmSource ?? null,
      opts.utmCampaign ?? null,
    ],
    queryFn: () =>
      leadsApi.list({
        projectId: projectId!,
        page: opts.page,
        pageSize: opts.pageSize,
        dateFrom: opts.dateFrom,
        dateTo: opts.dateTo,
        search: opts.search,
        status: opts.status,
        utmSource: opts.utmSource,
        utmCampaign: opts.utmCampaign,
      }),
    enabled: !!projectId,
    retry: 1,
  });

  const normalized = useMemo(() => normalizePaginatedResponse<Lead>(query.data), [query.data]);

  const leads = useMemo(() => normalizeLeads(query.data ?? undefined), [query.data]);

  return {
    query,
    leads,
    meta: normalized.meta,
    isServerPaginated: hasServerMeta(normalized.meta),
    raw: query.data,
  };
}
