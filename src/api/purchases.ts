import { api } from "./client";
import type { Purchase, PaginatedResponse } from "@/types";

export interface PurchasesQueryParams {
  projectId: string;
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  minValue?: number;
  maxValue?: number;
  utmSource?: string;
  utmCampaign?: string;
}

export const purchasesApi = {
  list: (params: PurchasesQueryParams) =>
    api.get<PaginatedResponse<Purchase>>("/analytics/purchases", {
      query: {
        projectId: params.projectId,
        page: params.page,
        pageSize: params.pageSize,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        search: params.search,
        minValue: params.minValue,
        maxValue: params.maxValue,
        utmSource: params.utmSource,
        utmCampaign: params.utmCampaign,
      },
    }),
};

export function normalizePurchases(
  res: PaginatedResponse<Purchase> | undefined | null,
): Purchase[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if ("data" in res && Array.isArray(res.data)) return res.data;
  if ("items" in res && Array.isArray(res.items)) return res.items;
  return [];
}

function toNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function purchaseTotal(p: Purchase): number {
  const candidates: unknown[] = [
    p.total,
    p.amount,
    (p as Record<string, unknown>).value,
    (p as Record<string, unknown>).revenue,
    (p as Record<string, unknown>).price,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== "") {
      const n = toNumber(c);
      if (n) return n;
    }
  }
  if (Array.isArray(p.items)) {
    return p.items.reduce((acc, it) => acc + toNumber(it.price) * (toNumber(it.quantity) || 1), 0);
  }
  return 0;
}
