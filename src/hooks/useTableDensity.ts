import { useCallback, useEffect, useState } from "react";

export type TableDensity = "compact" | "comfortable";

const STORAGE_KEY = "vps_table_density";
const DEFAULT: TableDensity = "comfortable";

function read(): TableDensity {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "compact" || v === "comfortable") return v;
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

const listeners = new Set<(d: TableDensity) => void>();

function broadcast(d: TableDensity) {
  listeners.forEach((cb) => cb(d));
}

export function useTableDensity() {
  const [density, setDensityState] = useState<TableDensity>(read);

  useEffect(() => {
    const cb = (d: TableDensity) => setDensityState(d);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const setDensity = useCallback((d: TableDensity) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, d);
    } catch {
      /* ignore */
    }
    broadcast(d);
  }, []);

  return { density, setDensity };
}

/** Tailwind classes aplicados ao <Table> para reduzir padding em modo compacto. */
export function densityTableClass(density: TableDensity): string {
  return density === "compact" ? "[&_th]:h-8 [&_th]:py-1 [&_td]:py-1.5 [&_td]:text-xs" : "";
}
