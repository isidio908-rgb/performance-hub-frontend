import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/EmptyState";
import type { ConversionPath } from "@/types";

interface Props {
  data: ConversionPath[];
  loading?: boolean;
  title?: string;
  description?: string;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);
const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function pathLabels(p: ConversionPath): string[] {
  const raw = p.path ?? p.steps ?? p.channels ?? [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((step) => {
      if (typeof step === "string") return step;
      if (step && typeof step === "object") {
        const s = step as Record<string, unknown>;
        return String(s.channel ?? s.source ?? s.utmSource ?? s.utmCampaign ?? s.type ?? "—");
      }
      return "—";
    })
    .filter(Boolean);
}

export function ConversionPathsTable({
  data,
  loading,
  title = "Caminhos de conversão",
  description = "Sequências de toques que levaram à conversão.",
}: Props) {
  const rows = data
    .map((p) => ({
      labels: pathLabels(p),
      count: Number(p.count ?? p.conversions ?? 0) || 0,
      revenue: Number(p.revenue ?? p.total ?? 0) || 0,
    }))
    .filter((r) => r.labels.length > 0)
    .slice(0, 30);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Sem caminhos de conversão"
            description="Ainda não há jornadas de conversão registradas."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caminho</TableHead>
                  <TableHead className="text-right">Conversões</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {r.labels.map((l, j) => (
                          <span key={j} className="flex items-center gap-1">
                            <Badge variant="secondary" className="font-normal">
                              {l}
                            </Badge>
                            {j < r.labels.length - 1 && (
                              <span className="text-muted-foreground">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{fmt(r.count)}</TableCell>
                    <TableCell className="text-right">{fmtBRL(r.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
