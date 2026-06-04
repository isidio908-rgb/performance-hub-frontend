import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_authenticated/ecommerce")({
  component: () => (
    <PlaceholderPage
      title="E-commerce"
      description="Compras, receita e funil de checkout."
    />
  ),
});
