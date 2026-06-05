import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AssistedChannel } from "@/types";
import { densityTableClass, type TableDensity } from "@/hooks/useTableDensity";

interface Props {
  data: AssistedChannel[];
  density?: TableDensity;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);
const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function normalizeAssistedRows(data: AssistedChannel[]) {
  return data
    .map((c) => ({
      channel: String(c.channel ?? c.source ?? c.utmSource ?? c.name ?? "—"),
      assisted: Number(c.assistedConversions ?? c.assisted ?? 0) || 0,
      direct: Number(c.directConversions ?? c.direct ?? 0) || 0,
      revenue: Number(c.revenue ?? c.total ?? 0) || 0,
    }))
    .sort((a, b) => b.assisted - a.assisted)
    .slice(0, 20);
}

export function AssistedChannelsTable({ data, density = "comfortable" }: Props) {
  const rows = normalizeAssistedRows(data);
  return (
    <Table className={densityTableClass(density)}>
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
            <TableCell className="text-right tabular-nums">{fmt(r.assisted)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmt(r.direct)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBRL(r.revenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
