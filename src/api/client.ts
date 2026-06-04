// Centralized API client. Swap VITE_API_BASE_URL to point at a new backend
// without touching any component.

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const TOKEN_KEY = "vps_access_token";
const REFRESH_KEY = "vps_refresh_token";
const USER_KEY = "vps_user";

export const tokenStorage = {
  get access(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  get refresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  setSession(access: string, refresh: string, user: unknown) {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  get user() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  // If BASE_URL is absolute, URL ctor above already used it correctly when given an absolute string.
  // Re-build cleanly when BASE_URL is absolute:
  const finalUrl = BASE_URL.startsWith("http")
    ? new URL(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`)
    : url;
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) finalUrl.searchParams.set(k, String(v));
    }
  }
  return finalUrl.toString();
}

export async function apiRequest<T = unknown>(
  path: string,
  { body, auth = true, query, headers, ...rest }: RequestOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(0, "VITE_API_BASE_URL não configurada");
  }

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = tokenStorage.access;
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(
      0,
      err instanceof Error ? err.message : "Falha de rede",
    );
  }

  const text = await response.text();
  const data = text ? safeJson(text) : undefined;

  if (!response.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : undefined) ?? response.statusText ?? "Erro na requisição";
    if (response.status === 401 && auth) {
      tokenStorage.clear();
    }
    throw new ApiError(response.status, msg, data);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
