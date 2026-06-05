import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states/EmptyState";
import {
  applyDateRange,
  DateRangeFilter,
  type DateRange,
} from "@/components/filters/DateRangeFilter";
import type { RevenueTimelinePoint } from "@/types";

interface Props {
  data: RevenueTimelinePoint[];
  loading?: boolean;
}

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function pickDate(p: RevenueTimelinePoint): string {
  return String(p.date ?? p.day ?? p.timestamp ?? "");
}
function pickRevenue(p: RevenueTimelinePoint): number {
  return Number(p.revenue ?? p.total ?? 0) || 0;
}

export function RevenueTimelineChart({ data, loading }: Props) {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });

  const normalized = useMemo(
    () =>
      data
        .map((p) => ({
          createdAt: pickDate(p),
          date: pickDate(p),
          revenue: pickRevenue(p),
        }))
        .filter((p) => p.date)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data],
  );

  const filtered = useMemo(() => applyDateRange(normalized, range), [normalized, range]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receita por período</CardTitle>
        <CardDescription>Receita diária do projeto selecionado.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <DateRangeFilter value={range} onChange={setRange} />
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sem dados de receita"
            description="Nenhum ponto no período selecionado."
          />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => fmtBRL(Number(v))}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => fmtBRL(Number(v))}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
