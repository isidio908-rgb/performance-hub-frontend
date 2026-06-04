// Centralized API client. Swap VITE_API_BASE_URL to point at a new backend
// without touching any component.

import { getApiBaseUrl, hasMixedContentRisk, isHttpApi, isHttpsPage } from "@/utils/runtime";

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
  setTokens(access: string, refresh: string) {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
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

export type ApiErrorKind = "missing_base_url" | "mixed_content" | "network" | "http";

export class ApiError extends Error {
  public kind: ApiErrorKind;
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
    kind: ApiErrorKind = "http",
  ) {
    super(message);
    this.kind = kind;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  _retried?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = getApiBaseUrl();
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Single-flight refresh promise. Garantia de que múltiplos 401 simultâneos
 * fazem APENAS uma chamada a /auth/refresh.
 */
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refresh = tokenStorage.refresh;
  if (!refresh) return null;

  const base = getApiBaseUrl();
  if (!base || hasMixedContentRisk(base)) return null;

  try {
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
      user?: unknown;
    };
    if (!data?.accessToken) return null;
    const newRefresh = data.refreshToken ?? refresh;
    if (data.user) {
      tokenStorage.setSession(data.accessToken, newRefresh, data.user);
    } else {
      tokenStorage.setTokens(data.accessToken, newRefresh);
    }
    return data.accessToken;
  } catch {
    return null;
  }
}

async function getFreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T = unknown>(
  path: string,
  { body, auth = true, query, headers, _retried, ...rest }: RequestOptions = {},
): Promise<T> {
  const base = getApiBaseUrl();

  if (!base) {
    throw new ApiError(
      0,
      "VITE_API_BASE_URL não configurada. Defina a URL HTTPS do backend no .env.",
      undefined,
      "missing_base_url",
    );
  }

  if (hasMixedContentRisk(base)) {
    throw new ApiError(
      0,
      "API em HTTP bloqueada pelo navegador. Configure VITE_API_BASE_URL com uma URL HTTPS ou use um proxy HTTPS para o backend.",
      { baseUrl: base, httpsPage: isHttpsPage(), httpApi: isHttpApi(base) },
      "mixed_content",
    );
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
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(
      0,
      err instanceof Error ? err.message : "Falha de rede",
      undefined,
      "network",
    );
  }

  const text = await response.text();
  const data = text ? safeJson(text) : undefined;

  if (!response.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : undefined) ??
      response.statusText ??
      "Erro na requisição";
    if (response.status === 401 && auth && !_retried && tokenStorage.refresh) {
      const newToken = await getFreshAccessToken();
      if (newToken) {
        return apiRequest<T>(path, {
          body,
          auth,
          query,
          headers,
          _retried: true,
          ...rest,
        });
      }
      tokenStorage.clear();
    } else if (response.status === 401 && auth) {
      tokenStorage.clear();
    }
    throw new ApiError(response.status, msg, data, "http");
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
  get: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
