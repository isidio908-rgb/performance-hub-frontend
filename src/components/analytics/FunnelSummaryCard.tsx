import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states/EmptyState";
import type { FunnelSummary } from "@/types";

interface Props {
  data: FunnelSummary | null;
  loading?: boolean;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

function deriveSteps(s: FunnelSummary | null): Array<{ name: string; count: number }> {
  if (!s) return [];
  if (Array.isArray(s.steps) && s.steps.length > 0) {
    return s.steps.map((st) => ({
      name: String(st.name ?? st.label ?? st.type ?? "Etapa"),
      count: Number(st.count ?? st.value ?? 0) || 0,
    }));
  }
  const order: Array<[string, number | undefined]> = [
    ["PageViews", s.pageViews],
    ["ViewContent", s.viewContent],
    ["Leads", s.leads],
    ["AddToCart", s.addToCart],
    ["InitiateCheckout", s.initiateCheckout],
    ["Purchase", s.purchase],
  ];
  return order
    .filter(([, v]) => typeof v === "number")
    .map(([name, v]) => ({ name, count: Number(v) || 0 }));
}

export function FunnelSummaryCard({ data, loading }: Props) {
  const steps = deriveSteps(data);
  const max = Math.max(1, ...steps.map((s) => s.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Funil de conversão</CardTitle>
        <CardDescription>Visão das etapas do funil para o projeto selecionado.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : steps.length === 0 ? (
          <EmptyState
            title="Sem dados de funil"
            description="Nenhum evento registrado para compor o funil."
          />
        ) : (
          <div className="space-y-2">
            {steps.map((s) => {
              const pct = (s.count / max) * 100;
              return (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">{fmt(s.count)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
