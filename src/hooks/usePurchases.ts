import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { purchasesApi, normalizePurchases, purchaseTotal } from "@/api/purchases";
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

export function usePurchases(projectId: string | null | undefined) {
  const query = useQuery({
    queryKey: ["analytics", "purchases", projectId],
    queryFn: () => purchasesApi.list(projectId!),
    enabled: !!projectId,
    retry: 1,
  });

  const purchases = useMemo(() => normalizePurchases(query.data), [query.data]);

  const metrics = useMemo(() => computePurchaseMetrics(purchases), [purchases]);

  return { query, purchases, metrics };
}
