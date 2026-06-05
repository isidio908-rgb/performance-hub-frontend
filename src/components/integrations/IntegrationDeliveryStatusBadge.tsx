import { Badge } from "@/components/ui/badge";
import type { IntegrationDeliveryStatus } from "@/types";

const MAP: Record<
  string,
  { label: string; variant: "muted" | "info" | "success" | "destructive" | "warning" }
> = {
  PENDING: { label: "Pendente", variant: "muted" },
  PROCESSING: { label: "Processando", variant: "info" },
  SUCCESS: { label: "Sucesso", variant: "success" },
  FAILED: { label: "Falhou", variant: "destructive" },
  RETRY: { label: "Retry", variant: "warning" },
};

export function IntegrationDeliveryStatusBadge({
  status,
}: {
  status?: IntegrationDeliveryStatus | null;
}) {
  if (!status) return <Badge variant="outline">—</Badge>;
  const conf = MAP[String(status).toUpperCase()];
  if (!conf) return <Badge variant="outline">{String(status)}</Badge>;
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}
