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
import { EmptyState } from "@/components/states/EmptyState";
import type { RevenueByCampaignItem } from "@/types";

interface Props {
  data: RevenueByCampaignItem[];
  loading?: boolean;
}

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

export function RevenueByCampaignTable({ data, loading }: Props) {
  const rows = data
    .map((i) => ({
      campaign: String(i.campaign ?? i.utmCampaign ?? i.name ?? "—"),
      source: String(i.source ?? i.channel ?? "—"),
      revenue: Number(i.revenue ?? i.total ?? 0) || 0,
      purchases: Number(i.purchases ?? i.count ?? 0) || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receita por campanha</CardTitle>
        <CardDescription>Top 20 campanhas por receita atribuída.</CardDescription>
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
            title="Sem receita por campanha"
            description="Nenhuma compra atribuída a campanhas."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Canal / Fonte</TableHead>
                  <TableHead className="text-right">Compras</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={`${r.campaign}-${i}`}>
                    <TableCell className="font-medium">{r.campaign}</TableCell>
                    <TableCell className="text-muted-foreground">{r.source}</TableCell>
                    <TableCell className="text-right">{fmt(r.purchases)}</TableCell>
                    <TableCell className="text-right font-medium">{fmtBRL(r.revenue)}</TableCell>
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
