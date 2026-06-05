import { Badge } from "@/components/ui/badge";
import type { IntegrationDeliveryStatus } from "@/types";

const MAP: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pendente",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  PROCESSING: {
    label: "Processando",
    className: "bg-primary/15 text-primary border-transparent",
  },
  SUCCESS: {
    label: "Sucesso",
    className: "bg-success/15 text-success-foreground border-transparent",
  },
  FAILED: {
    label: "Falhou",
    className: "bg-destructive/15 text-destructive border-transparent",
  },
  RETRY: {
    label: "Retry",
    className: "bg-warning/15 text-warning-foreground border-transparent",
  },
};

export function IntegrationDeliveryStatusBadge({
  status,
}: {
  status?: IntegrationDeliveryStatus | null;
}) {
  if (!status) return <Badge variant="outline">—</Badge>;
  const conf = MAP[String(status).toUpperCase()];
  if (!conf) return <Badge variant="outline">{String(status)}</Badge>;
  return <Badge className={conf.className}>{conf.label}</Badge>;
}
