import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { Lead } from "@/types";

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Fonte</TableHead>
            <TableHead>UTM</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Quando</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{l.name || "—"}</TableCell>
              <TableCell className="text-sm">
                <div>{l.email || "—"}</div>
                {l.phone && <div className="text-xs text-muted-foreground">{l.phone}</div>}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{l.source || "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {[l.utmSource, l.utmMedium, l.utmCampaign].filter(Boolean).join(" / ") || "—"}
              </TableCell>
              <TableCell>
                <LeadStatusBadge status={l.status ?? undefined} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                {formatDateTime(l.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
