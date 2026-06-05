import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states/EmptyState";
import type { AttributionSummary } from "@/types";

interface Props {
  data: AttributionSummary | null;
  loading?: boolean;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);
const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function AttributionOverview({ data, loading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atribuição</CardTitle>
        <CardDescription>Visão consolidada do modelo de atribuição selecionado.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !data ? (
          <EmptyState
            title="Sem dados de atribuição"
            description="Nenhum dado foi retornado pelo backend."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Metric label="Modelo" value={String(data.model ?? "—")} />
            <Metric label="Conversões" value={fmt(Number(data.totalConversions ?? 0) || 0)} />
            <Metric label="Receita atribuída" value={fmtBRL(Number(data.totalRevenue ?? 0) || 0)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
