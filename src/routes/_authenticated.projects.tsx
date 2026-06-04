import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_authenticated/projects")({
  component: () => (
    <PlaceholderPage
      title="Projetos"
      description="Projetos vinculados a cada cliente."
    />
  ),
});
