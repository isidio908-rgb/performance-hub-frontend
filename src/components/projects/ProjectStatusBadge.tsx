import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types";

const META: Record<ProjectStatus, { label: string; variant: "success" | "warning" | "muted" }> = {
  ACTIVE: { label: "Ativo", variant: "success" },
  PAUSED: { label: "Pausado", variant: "warning" },
  ARCHIVED: { label: "Arquivado", variant: "muted" },
};

export function ProjectStatusBadge({ status }: { status?: ProjectStatus }) {
  if (!status) return null;
  const meta = META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
