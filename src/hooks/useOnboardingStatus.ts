import { useQuery } from "@tanstack/react-query";
import { onboardingApi } from "@/api/onboarding";
import { tokenStorage } from "@/api/client";

export const ONBOARDING_STATUS_KEY = ["onboarding", "status"] as const;

// GET /onboarding/status — fonte oficial. Componentes devem manter o fallback
// local (utils/onboarding.ts) caso essa query falhe.
export function useOnboardingStatus() {
  return useQuery({
    queryKey: ONBOARDING_STATUS_KEY,
    queryFn: () => onboardingApi.status(),
    enabled: typeof window !== "undefined" && !!tokenStorage.access,
    retry: 0,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
