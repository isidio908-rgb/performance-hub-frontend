import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { purchasesApi, normalizePurchases, purchaseTotal } from "@/api/purchases";
import { normalizePaginatedResponse, hasServerMeta } from "@/utils/pagination";
import type { Purchase } from "@/types";

export interface PurchaseMetrics {
  totalRevenue: number;
  totalPurchases: number;
  averageTicket: number;
  highestPurchase: number;
  mainCurrency: string;
}

export function computePurchaseMetrics(purchases: Purchase[]): PurchaseMetrics {
  const totalPurchases = purchases.length;
  let totalRevenue = 0;
  let highestPurchase = 0;
  const currencyCount = new Map<string, number>();

  for (const p of purchases) {
    const t = purchaseTotal(p);
    totalRevenue += t;
    if (t > highestPurchase) highestPurchase = t;
    const c = (p.currency || "").toString().trim().toUpperCase();
    if (c) currencyCount.set(c, (currencyCount.get(c) ?? 0) + 1);
  }

  let mainCurrency = "BRL";
  let max = 0;
  for (const [c, n] of currencyCount) {
    if (n > max) {
      max = n;
      mainCurrency = c;
    }
  }

  const averageTicket = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

  return {
    totalRevenue,
    totalPurchases,
    averageTicket,
    highestPurchase,
    mainCurrency,
  };
}

export interface UsePurchasesOptions {
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

export function usePurchases(projectId: string | null | undefined, opts: UsePurchasesOptions = {}) {
  const query = useQuery({
    queryKey: [
      "analytics",
      "purchases",
      projectId,
      opts.page ?? null,
      opts.pageSize ?? null,
      opts.dateFrom ?? null,
      opts.dateTo ?? null,
      opts.search ?? null,
      opts.minValue ?? null,
      opts.maxValue ?? null,
      opts.utmSource ?? null,
      opts.utmCampaign ?? null,
    ],
    queryFn: () =>
      purchasesApi.list({
        projectId: projectId!,
        page: opts.page,
        pageSize: opts.pageSize,
        dateFrom: opts.dateFrom,
        dateTo: opts.dateTo,
        search: opts.search,
        minValue: opts.minValue,
        maxValue: opts.maxValue,
        utmSource: opts.utmSource,
        utmCampaign: opts.utmCampaign,
      }),
    enabled: !!projectId,
    retry: 1,
  });

  const normalized = useMemo(() => normalizePaginatedResponse<Purchase>(query.data), [query.data]);

  const purchases = useMemo(() => normalizePurchases(query.data ?? undefined), [query.data]);

  const metrics = useMemo(() => computePurchaseMetrics(purchases), [purchases]);

  return {
    query,
    purchases,
    meta: normalized.meta,
    isServerPaginated: hasServerMeta(normalized.meta),
    metrics,
    raw: query.data,
  };
}
