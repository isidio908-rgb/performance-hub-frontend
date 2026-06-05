import { CheckCircle2, AlertTriangle, XCircle, Loader2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DiagnosticStatus } from "@/hooks/useSystemDiagnostics";

const CONFIG: Record<
  DiagnosticStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  success: {
    label: "OK",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  warning: {
    label: "Atenção",
    icon: AlertTriangle,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  error: {
    label: "Erro",
    icon: XCircle,
    className: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  pending: {
    label: "Verificando",
    icon: Loader2,
    className: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  idle: {
    label: "—",
    icon: Circle,
    className: "bg-muted text-muted-foreground border-border",
  },
};

interface Props {
  status: DiagnosticStatus;
  label?: string;
  className?: string;
}

export function DiagnosticStatusBadge({ status, label, className }: Props) {
  const c = CONFIG[status];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={cn(c.className, className)}>
      <Icon className={cn("mr-1 h-3 w-3", status === "pending" && "animate-spin")} />
      {label ?? c.label}
    </Badge>
  );
}
