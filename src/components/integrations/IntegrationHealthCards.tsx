import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states/EmptyState";
import { IntegrationProviderBadge } from "./IntegrationProviderBadge";
import type { IntegrationHealth } from "@/types";

interface Props {
  data: IntegrationHealth[];
  loading?: boolean;
}

function statusColor(h: IntegrationHealth): string {
  const s = String(h.status ?? "").toUpperCase();
  if (s === "HEALTHY" || h.healthy === true) return "bg-success";
  if (s === "DEGRADED") return "bg-warning";
  if (s === "DOWN" || h.healthy === false) return "bg-destructive";
  return "bg-muted-foreground/40";
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

export function IntegrationHealthCards({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <EmptyState
        title="Sem integrações"
        description="Nenhuma integração configurada para este projeto."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {data.map((h, i) => (
        <Card key={h.id ?? `${h.provider}-${i}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <IntegrationProviderBadge provider={h.provider} />
              <span
                className={`inline-block h-2 w-2 rounded-full ${statusColor(h)}`}
                title={String(h.status ?? "")}
              />
            </div>
            <CardTitle className="text-base">
              {h.name ?? String(h.provider ?? "Integração")}
            </CardTitle>
            {h.message && <CardDescription>{h.message}</CardDescription>}
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-xs">
            <Metric label="Sucesso" value={fmt(Number(h.successCount ?? 0))} />
            <Metric label="Falhas" value={fmt(Number(h.failureCount ?? 0))} />
            <Metric label="Pendentes" value={fmt(Number(h.pendingCount ?? 0))} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/40 p-2">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}
