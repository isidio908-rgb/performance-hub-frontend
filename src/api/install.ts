import { api } from "./client";

export interface ProjectInstallInfo {
  projectId: string;
  projectName: string;
  domain?: string | null;
  trackingKey: string;
  trackerUrl: string;
  scriptTag: string;
  lastEventAt?: string | null;
  hasReceivedEvents: boolean;
}

type Wrapped<T> = T | { data: T } | null | undefined;

function unwrap<T>(res: Wrapped<T>): T | null {
  if (!res) return null;
  if (typeof res === "object" && res !== null && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (d && typeof d === "object") return d as T;
  }
  return res as T;
}

// GET /projects/:id/install — backend V3.4
// POST /projects/:id/test-event — backend V3.4.2
export const installApi = {
  info: async (projectId: string): Promise<ProjectInstallInfo | null> => {
    const r = await api.get<Wrapped<ProjectInstallInfo>>(`/projects/${projectId}/install`);
    return unwrap<ProjectInstallInfo>(r);
  },
  sendTestEvent: (projectId: string) => api.post<unknown>(`/projects/${projectId}/test-event`, {}),
};
