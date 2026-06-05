import { Badge } from "@/components/ui/badge";
import type { IntegrationProvider } from "@/types";

const LABELS: Record<string, string> = {
  META_CAPI: "Meta CAPI",
  GA4: "GA4",
  GOOGLE_ADS: "Google Ads",
  WEBHOOK: "Webhook",
};

export function IntegrationProviderBadge({ provider }: { provider?: IntegrationProvider | null }) {
  if (!provider) return <Badge variant="outline">—</Badge>;
  const label = LABELS[String(provider)] ?? String(provider);
  return <Badge variant="secondary">{label}</Badge>;
}
