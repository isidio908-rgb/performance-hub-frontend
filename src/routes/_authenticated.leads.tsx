import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_authenticated/leads")({
  component: () => (
    <PlaceholderPage title="Leads" description="Tabela de leads gerados." />
  ),
});
