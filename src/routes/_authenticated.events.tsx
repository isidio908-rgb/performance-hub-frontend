import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_authenticated/events")({
  component: () => (
    <PlaceholderPage title="Eventos" description="Tabela de eventos capturados." />
  ),
});
