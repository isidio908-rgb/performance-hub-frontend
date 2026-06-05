import { useCallback, useEffect, useRef, useState } from "react";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed == null) return fallback;
    return { ...(fallback as object), ...(parsed as object) } as T;
  } catch {
    return fallback;
  }
}

/**
 * Persist a piece of UI state (filters, pageSize, etc.) in localStorage.
 * Never use this for sensitive data.
 */
export function usePersistedState<T extends object>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const initialRef = useRef(initial);
  const [state, setState] = useState<T>(() => read<T>(key, initialRef.current));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore quota/serialization errors
    }
  }, [key, state]);

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setState((prev) => (typeof v === "function" ? (v as (p: T) => T)(prev) : v));
  }, []);

  return [state, set];
}
