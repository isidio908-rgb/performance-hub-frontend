import { api } from "./client";
import type { Lead, PaginatedResponse } from "@/types";

export interface LeadsQueryParams {
  projectId: string;
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  status?: string;
  utmSource?: string;
  utmCampaign?: string;
}

export const leadsApi = {
  list: (params: LeadsQueryParams) =>
    api.get<PaginatedResponse<Lead>>("/analytics/leads", {
      query: {
        projectId: params.projectId,
        page: params.page,
        pageSize: params.pageSize,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        search: params.search,
        status: params.status,
        utmSource: params.utmSource,
        utmCampaign: params.utmCampaign,
      },
    }),
};

export function normalizeLeads(res: PaginatedResponse<Lead> | undefined | null): Lead[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if ("data" in res && Array.isArray(res.data)) return res.data;
  if ("items" in res && Array.isArray(res.items)) return res.items;
  return [];
}
