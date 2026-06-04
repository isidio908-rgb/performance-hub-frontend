import { api } from "./client";
import type { Purchase } from "@/types";

type ListResponse =
  | Purchase[]
  | { data: Purchase[]; meta?: unknown }
  | { items: Purchase[]; meta?: unknown };

export const purchasesApi = {
  list: (projectId: string) =>
    api.get<ListResponse>("/analytics/purchases", { query: { projectId } }),
};

export function normalizePurchases(res: ListResponse | undefined): Purchase[] {
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
