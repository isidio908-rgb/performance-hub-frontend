import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_authenticated/clients")({
  component: () => (
    <PlaceholderPage
      title="Clientes"
      description="CRUD de clientes da plataforma."
    />
  ),
});
