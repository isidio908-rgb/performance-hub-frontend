import type { PaginatedResponse, PaginationMeta } from "@/types";

export interface NormalizedPaginated<T> {
  items: T[];
  meta?: PaginationMeta;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function normalizePaginatedResponse<T>(
  response: PaginatedResponse<T> | null | undefined | unknown,
): NormalizedPaginated<T> {
  if (response == null) return { items: [] };
  if (Array.isArray(response)) return { items: response as T[] };
  if (isRecord(response)) {
    const r = response;
    const meta = isRecord(r.meta) ? (r.meta as PaginationMeta) : undefined;
    if (Array.isArray(r.data)) return { items: r.data as T[], meta };
    if (Array.isArray(r.items)) return { items: r.items as T[], meta };
  }
  return { items: [] };
}

export function getTotalPages(total: number, pageSize: number): number {
  if (!pageSize || pageSize <= 0) return 1;
  if (!total || total <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (totalPages > 0 && page > totalPages) return totalPages;
  return Math.floor(page);
}

export function paginateClientSide<T>(
  items: T[],
  page: number,
  pageSize: number,
): NormalizedPaginated<T> {
  const total = items.length;
  const totalPages = getTotalPages(total, pageSize);
  const safePage = clampPage(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    meta: { page: safePage, pageSize, total, totalPages },
  };
}

export function hasServerMeta(meta?: PaginationMeta): boolean {
  if (!meta) return false;
  return (
    typeof meta.total === "number" ||
    typeof meta.totalPages === "number" ||
    (typeof meta.page === "number" && typeof meta.pageSize === "number")
  );
}
