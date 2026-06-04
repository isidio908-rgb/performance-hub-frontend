import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_authenticated/settings")({
  component: () => (
    <PlaceholderPage title="Configurações" description="Preferências da conta e do workspace." />
  ),
});
