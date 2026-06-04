import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types";

const LABEL: Record<ProjectStatus, string> = {
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  ARCHIVED: "Arquivado",
};

const CLASS: Record<ProjectStatus, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PAUSED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
};

export function ProjectStatusBadge({ status }: { status?: ProjectStatus }) {
  if (!status) return null;
  return (
    <Badge variant="outline" className={CLASS[status]}>
      {LABEL[status]}
    </Badge>
  );
}
