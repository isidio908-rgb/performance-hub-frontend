import { Activity, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectHealth } from "@/hooks/useProjectHealth";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string | null | undefined;
  className?: string;
  compact?: boolean;
}

const STATUS_META: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "destructive" | "muted";
    icon: typeof CheckCircle2;
  }
> = {
  HEALTHY: { label: "Saudável", variant: "success", icon: CheckCircle2 },
  WARNING: { label: "Atenção", variant: "warning", icon: AlertTriangle },
  ERROR: { label: "Erro", variant: "destructive", icon: AlertTriangle },
  UNKNOWN: { label: "Desconhecido", variant: "muted", icon: HelpCircle },
};

export function ProjectHealthBadge({ projectId, className, compact }: Props) {
  const q = useProjectHealth(projectId);

  if (!projectId) return null;
  if (q.isLoading) {
    return <Skeleton className={cn("h-5 w-20 rounded-md", className)} />;
  }
  if (q.isError || !q.data) return null;

  const status = (q.data.status ?? "UNKNOWN").toUpperCase();
  const meta = STATUS_META[status] ?? STATUS_META.UNKNOWN;
  const Icon = meta.icon;

  return (
    <Badge
      variant={meta.variant}
      className={className}
      title={
        q.data.events24h !== undefined ? `Eventos nas últimas 24h: ${q.data.events24h}` : undefined
      }
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {compact ? meta.label : `Saúde: ${meta.label}`}
      {!compact && q.data.events24h !== undefined && (
        <span className="ml-1 inline-flex items-center gap-1 text-[10px] opacity-80">
          <Activity className="h-2.5 w-2.5" aria-hidden="true" />
          {q.data.events24h}
        </span>
      )}
    </Badge>
  );
}
