import { Badge } from "@/components/ui/badge";

const fmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function RevenueBadge({ value, currency }: { value: number; currency?: string | null }) {
  const formatted =
    currency && currency !== "BRL"
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency,
        }).format(value)
      : fmt.format(value);
  return (
    <Badge
      variant="outline"
      className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
    >
      {formatted}
    </Badge>
  );
}
