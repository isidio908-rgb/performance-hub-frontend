import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states/EmptyState";
import type { RevenueByChannelItem } from "@/types";

interface Props {
  data: RevenueByChannelItem[];
  loading?: boolean;
}

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function RevenueByChannelChart({ data, loading }: Props) {
  const normalized = data
    .map((i) => ({
      channel: String(i.channel ?? i.source ?? i.utmSource ?? i.name ?? "—"),
      revenue: Number(i.revenue ?? i.total ?? 0) || 0,
    }))
    .filter((i) => i.channel)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receita por canal</CardTitle>
        <CardDescription>Top 10 canais por receita atribuída.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : normalized.length === 0 ? (
          <EmptyState
            title="Sem receita por canal"
            description="Nenhuma compra atribuída a canais."
          />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={normalized}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="channel" stroke="var(--muted-foreground)" fontSize={11} />
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
                <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
