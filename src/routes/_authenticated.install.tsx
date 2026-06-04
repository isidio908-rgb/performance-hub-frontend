import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_authenticated/install")({
  component: () => (
    <PlaceholderPage
      title="Instalação"
      description="Tracking key, domínio e script de instalação do projeto."
    />
  ),
});
