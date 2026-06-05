import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics";
import type { AttributionModel } from "@/types";

const STALE = 60_000;

export function useRevenueTimeline(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["analytics", "revenue-timeline", projectId],
    queryFn: () => analyticsApi.revenueTimeline(projectId!),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}

export function useFunnelSummary(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["analytics", "funnel-summary", projectId],
    queryFn: () => analyticsApi.funnelSummary(projectId!),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}

export function useRevenueByChannel(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["analytics", "revenue-by-channel", projectId],
    queryFn: () => analyticsApi.revenueByChannel(projectId!),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}

export function useRevenueByCampaign(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["analytics", "revenue-by-campaign", projectId],
    queryFn: () => analyticsApi.revenueByCampaign(projectId!),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}

export function useAttribution(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["analytics", "attribution", projectId],
    queryFn: () => analyticsApi.attribution(projectId!),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}

export function useAttributionModels(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["analytics", "attribution-models", projectId],
    queryFn: () => analyticsApi.attributionModels(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useConversionPaths(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["analytics", "conversion-paths", projectId],
    queryFn: () => analyticsApi.conversionPaths(projectId!),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTopConversionPaths(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ["analytics", "top-conversion-paths", projectId],
    queryFn: () => analyticsApi.topConversionPaths(projectId!),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}

export function useAssistedChannels(
  projectId: string | null | undefined,
  model?: AttributionModel,
) {
  return useQuery({
    queryKey: ["analytics", "assisted-channels", projectId, model ?? null],
    queryFn: () => analyticsApi.assistedChannels(projectId!, model),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}

export function useAttributionCredits(
  projectId: string | null | undefined,
  model?: AttributionModel,
) {
  return useQuery({
    queryKey: ["analytics", "attribution-credits", projectId, model ?? null],
    queryFn: () => analyticsApi.attributionCredits(projectId!, model),
    enabled: !!projectId,
    staleTime: STALE,
    retry: 1,
  });
}
