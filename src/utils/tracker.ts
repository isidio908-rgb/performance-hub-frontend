import { getApiBaseUrl } from "./runtime";

// O tracker é servido pelo backend em /public/tracker.js.
// VITE_API_BASE_URL pode terminar em /api ou não — preservamos a URL como
// configurada, apenas concatenando o path correto.
export function getTrackerScriptUrl(): string | null {
  const base = getApiBaseUrl();
  if (!base) return null;
  return `${base}/public/tracker.js`;
}

export function buildTrackerScript(trackingKey: string): string | null {
  const url = getTrackerScriptUrl();
  if (!url) return null;
  return `<script async src="${url}" data-tracking-key="${trackingKey}"></script>`;
}
