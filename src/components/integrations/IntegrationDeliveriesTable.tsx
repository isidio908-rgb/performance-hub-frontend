import { RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IntegrationProviderBadge } from "./IntegrationProviderBadge";
import { IntegrationDeliveryStatusBadge } from "./IntegrationDeliveryStatusBadge";
import type { IntegrationDelivery } from "@/types";

interface Props {
  deliveries: IntegrationDelivery[];
  onRetry: (id: string) => void;
  retryingId?: string | null;
}

function fmtDate(s?: string) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("pt-BR");
  } catch {
    return s;
  }
}

export function IntegrationDeliveriesTable({ deliveries, onRetry, retryingId }: Props) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Tentativas</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Erro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((d) => (
            <TableRow key={d.id}>
              <TableCell>
                <IntegrationProviderBadge provider={d.provider} />
              </TableCell>
              <TableCell>
                <IntegrationDeliveryStatusBadge status={d.status} />
              </TableCell>
              <TableCell className="text-xs">
                {d.eventType ?? "—"}
                {d.eventId && (
                  <span className="ml-1 text-muted-foreground">
                    #{String(d.eventId).slice(0, 8)}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-xs">
                {Number(d.attempts ?? 0)}
                {d.maxAttempts ? ` / ${d.maxAttempts}` : ""}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {fmtDate(d.createdAt)}
              </TableCell>
              <TableCell
                className="max-w-[280px] truncate text-xs text-destructive"
                title={d.error ?? ""}
              >
                {d.error ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRetry(d.id)}
                  disabled={retryingId === d.id}
                >
                  <RefreshCw
                    className={`mr-1 h-3 w-3 ${retryingId === d.id ? "animate-spin" : ""}`}
                  />
                  Tentar novamente
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
