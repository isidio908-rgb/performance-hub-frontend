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
import type { AssistedChannel } from "@/types";

interface Props {
  data: AssistedChannel[];
  loading?: boolean;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);
const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function AssistedChannelsTable({ data, loading }: Props) {
  const rows = data
    .map((c) => ({
      channel: String(c.channel ?? c.source ?? c.utmSource ?? c.name ?? "—"),
      assisted: Number(c.assistedConversions ?? c.assisted ?? 0) || 0,
      direct: Number(c.directConversions ?? c.direct ?? 0) || 0,
      revenue: Number(c.revenue ?? c.total ?? 0) || 0,
    }))
    .sort((a, b) => b.assisted - a.assisted)
    .slice(0, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Canais assistidos</CardTitle>
        <CardDescription>Conversões assistidas vs diretas por canal.</CardDescription>
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
            title="Sem canais assistidos"
            description="Nenhuma assistência de canal registrada."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead className="text-right">Assistidas</TableHead>
                  <TableHead className="text-right">Diretas</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{r.channel}</TableCell>
                    <TableCell className="text-right">{fmt(r.assisted)}</TableCell>
                    <TableCell className="text-right">{fmt(r.direct)}</TableCell>
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
