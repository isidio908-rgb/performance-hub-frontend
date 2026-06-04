import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_authenticated/integrations")({
  component: () => (
    <PlaceholderPage
      title="Integrações"
      description="Meta CAPI, GA4, Google Ads e status de cada integração."
    />
  ),
});
