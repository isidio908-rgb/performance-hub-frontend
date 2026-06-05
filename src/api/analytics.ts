import { api } from "./client";
import type {
  RevenueTimelinePoint,
  FunnelSummary,
  RevenueByChannelItem,
  RevenueByCampaignItem,
  AttributionSummary,
  ConversionPath,
  AssistedChannel,
  AttributionModel,
} from "@/types";

type Wrapped<T> = T | { data: T } | { items: T } | null | undefined;

function unwrap<T>(res: Wrapped<T[]>): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (typeof res === "object") {
    const r = res as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data as T[];
    if (Array.isArray(r.items)) return r.items as T[];
  }
  return [];
}

function unwrapObject<T extends object>(res: Wrapped<T>): T | null {
  if (!res) return null;
  if (Array.isArray(res)) return (res[0] as T) ?? null;
  if (typeof res === "object") {
    const r = res as Record<string, unknown>;
    if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) return r.data as T;
    if (r.items && typeof r.items === "object" && !Array.isArray(r.items)) return r.items as T;
    return res as T;
  }
  return null;
}

export const analyticsApi = {
  revenueTimeline: async (projectId: string): Promise<RevenueTimelinePoint[]> => {
    const r = await api.get<Wrapped<RevenueTimelinePoint[]>>("/analytics/revenue-timeline", {
      query: { projectId },
    });
    return unwrap<RevenueTimelinePoint>(r);
  },
  funnelSummary: async (projectId: string): Promise<FunnelSummary | null> => {
    const r = await api.get<Wrapped<FunnelSummary>>("/analytics/funnel-summary", {
      query: { projectId },
    });
    return unwrapObject<FunnelSummary>(r);
  },
  revenueByChannel: async (projectId: string): Promise<RevenueByChannelItem[]> => {
    const r = await api.get<Wrapped<RevenueByChannelItem[]>>("/analytics/revenue-by-channel", {
      query: { projectId },
    });
    return unwrap<RevenueByChannelItem>(r);
  },
  revenueByCampaign: async (projectId: string): Promise<RevenueByCampaignItem[]> => {
    const r = await api.get<Wrapped<RevenueByCampaignItem[]>>("/analytics/revenue-by-campaign", {
      query: { projectId },
    });
    return unwrap<RevenueByCampaignItem>(r);
  },
  attribution: async (projectId: string): Promise<AttributionSummary | null> => {
    const r = await api.get<Wrapped<AttributionSummary>>("/analytics/attribution", {
      query: { projectId },
    });
    return unwrapObject<AttributionSummary>(r);
  },
  attributionModels: async (projectId: string): Promise<AttributionModel[]> => {
    const r = await api.get<Wrapped<AttributionModel[]>>("/analytics/attribution-models", {
      query: { projectId },
    });
    return unwrap<AttributionModel>(r);
  },
  conversionPaths: async (projectId: string): Promise<ConversionPath[]> => {
    const r = await api.get<Wrapped<ConversionPath[]>>("/analytics/conversion-paths", {
      query: { projectId },
    });
    return unwrap<ConversionPath>(r);
  },
  assistedConversions: async (projectId: string, model?: AttributionModel): Promise<unknown[]> => {
    const r = await api.get<Wrapped<unknown[]>>("/analytics/assisted-conversions", {
      query: { projectId, model },
    });
    return unwrap<unknown>(r);
  },
  attributionCredits: async (projectId: string, model?: AttributionModel): Promise<unknown[]> => {
    const r = await api.get<Wrapped<unknown[]>>("/analytics/attribution-credits", {
      query: { projectId, model },
    });
    return unwrap<unknown>(r);
  },
  topConversionPaths: async (projectId: string): Promise<ConversionPath[]> => {
    const r = await api.get<Wrapped<ConversionPath[]>>("/analytics/top-conversion-paths", {
      query: { projectId },
    });
    return unwrap<ConversionPath>(r);
  },
  assistedChannels: async (
    projectId: string,
    model?: AttributionModel,
  ): Promise<AssistedChannel[]> => {
    const r = await api.get<Wrapped<AssistedChannel[]>>("/analytics/assisted-channels", {
      query: { projectId, model },
    });
    return unwrap<AssistedChannel>(r);
  },
  integrations: async (projectId: string): Promise<unknown[]> => {
    const r = await api.get<Wrapped<unknown[]>>("/analytics/integrations", {
      query: { projectId },
    });
    return unwrap<unknown>(r);
  },
};
