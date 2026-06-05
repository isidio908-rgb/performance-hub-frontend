import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EventTypeBadge } from "./EventTypeBadge";
import type { AnalyticsEvent } from "@/types";
import { densityTableClass, type TableDensity } from "@/hooks/useTableDensity";

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function CopyCell({ value }: { value?: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="inline-flex items-center gap-1 font-mono text-xs">
      <span className="max-w-[120px] truncate">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        aria-label={copied ? "Copiado" : "Copiar valor"}
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}

interface Props {
  events: AnalyticsEvent[];
  density?: TableDensity;
}

export function EventsTable({ events, density = "comfortable" }: Props) {
  return (
    <Table className={densityTableClass(density)}>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>URL / Nome</TableHead>
          <TableHead>Visitor</TableHead>
          <TableHead>Sessão</TableHead>
          <TableHead>UTM</TableHead>
          <TableHead className="text-right">Quando</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((e) => (
          <TableRow key={e.id}>
            <TableCell>
              <EventTypeBadge type={String(e.type)} />
            </TableCell>
            <TableCell className="max-w-[280px]">
              <div className="truncate text-sm">{e.name || e.currentUrl || "—"}</div>
              {e.currentUrl && e.name && (
                <div className="truncate text-xs text-muted-foreground">{e.currentUrl}</div>
              )}
            </TableCell>
            <TableCell>
              <CopyCell value={e.visitorId} />
            </TableCell>
            <TableCell>
              <CopyCell value={e.sessionId} />
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {[e.utmSource, e.utmMedium, e.utmCampaign].filter(Boolean).join(" / ") || "—"}
            </TableCell>
            <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
              {formatDateTime(e.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
