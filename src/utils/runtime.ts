// Runtime environment diagnostics. Single source of truth for API URL
// validation and mixed-content detection.

export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
  return raw.replace(/\/$/, "");
}

export function isHttpsPage(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:";
}

export function isHttpApi(url = getApiBaseUrl()): boolean {
  return /^http:\/\//i.test(url);
}

export function hasMixedContentRisk(url = getApiBaseUrl()): boolean {
  return isHttpsPage() && isHttpApi(url);
}

export interface ApiEnvironmentStatus {
  baseUrl: string;
  configured: boolean;
  mixedContent: boolean;
  httpsPage: boolean;
  httpApi: boolean;
}

export function getApiEnvironmentStatus(): ApiEnvironmentStatus {
  const baseUrl = getApiBaseUrl();
  return {
    baseUrl,
    configured: baseUrl.length > 0,
    mixedContent: hasMixedContentRisk(baseUrl),
    httpsPage: isHttpsPage(),
    httpApi: isHttpApi(baseUrl),
  };
}
