import { api } from "./client";

export type OnboardingNextStep =
  | "CREATE_CLIENT"
  | "CREATE_PROJECT"
  | "INSTALL_TRACKING"
  | "SEND_TEST_EVENT"
  | "WAIT_FOR_EVENT"
  | "VIEW_EVENTS"
  | "VIEW_DASHBOARD"
  | string;

export interface OnboardingStatus {
  hasClients: boolean;
  hasProjects: boolean;
  hasTrackingInstalled: boolean;
  hasEvents: boolean;
  nextStep: OnboardingNextStep;
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

// GET /onboarding/status
export const onboardingApi = {
  status: async (): Promise<OnboardingStatus | null> => {
    const r = await api.get<Wrapped<OnboardingStatus>>("/onboarding/status");
    return unwrap<OnboardingStatus>(r);
  },
};

export const NEXT_STEP_ROUTE: Record<string, string> = {
  CREATE_CLIENT: "/clients",
  CREATE_PROJECT: "/projects",
  INSTALL_TRACKING: "/install",
  SEND_TEST_EVENT: "/install",
  WAIT_FOR_EVENT: "/install",
  VIEW_EVENTS: "/events",
  VIEW_DASHBOARD: "/dashboard",
};

export function getNextStepRoute(nextStep: string | undefined | null): string {
  if (!nextStep) return "/dashboard";
  return NEXT_STEP_ROUTE[nextStep] ?? "/dashboard";
}
