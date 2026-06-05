import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ConversionPath } from "@/types";
import { densityTableClass, type TableDensity } from "@/hooks/useTableDensity";

interface Props {
  data: ConversionPath[];
  density?: TableDensity;
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

export function normalizePathRows(data: ConversionPath[]) {
  return data
    .map((p) => ({
      labels: pathLabels(p),
      count: Number(p.count ?? p.conversions ?? 0) || 0,
      revenue: Number(p.revenue ?? p.total ?? 0) || 0,
    }))
    .filter((r) => r.labels.length > 0)
    .slice(0, 30);
}

export function ConversionPathsTable({ data, density = "comfortable" }: Props) {
  const rows = normalizePathRows(data);
  return (
    <Table className={densityTableClass(density)}>
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
                    {j < r.labels.length - 1 && <span className="text-muted-foreground">→</span>}
                  </span>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{fmt(r.count)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBRL(r.revenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
