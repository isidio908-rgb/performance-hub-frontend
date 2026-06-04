import {
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
  Play,
  Pause,
  Archive,
  Activity,
  UserPlus,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { TrackingKeyCopy } from "./TrackingKeyCopy";
import type { Project, ProjectStatus } from "@/types";

interface Props {
  project: Project;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangeStatus?: (status: ProjectStatus) => void;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return null;
  }
}

export function ProjectCard({
  project,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onChangeStatus,
}: Props) {
  const created = formatDate(project.createdAt);
  const eventsCount = project._count?.events ?? project.eventsCount;
  const leadsCount = project._count?.leads ?? project.leadsCount;
  const purchasesCount = project._count?.purchases ?? project.purchasesCount;

  return (
    <Card
      className={`transition-colors hover:border-primary/40 ${
        selected ? "border-primary/60 ring-1 ring-primary/30" : ""
      }`}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold">{project.name}</p>
            {project.client?.name && (
              <p className="truncate text-xs text-muted-foreground">{project.client.name}</p>
            )}
          </button>
          <div className="flex items-center gap-1">
            <ProjectStatusBadge status={project.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                {onChangeStatus && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onChangeStatus("ACTIVE")}>
                      <Play className="mr-2 h-4 w-4" /> Ativar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangeStatus("PAUSED")}>
                      <Pause className="mr-2 h-4 w-4" /> Pausar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangeStatus("ARCHIVED")}>
                      <Archive className="mr-2 h-4 w-4" /> Arquivar
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {project.domain && (
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span className="truncate">{project.domain}</span>
          </div>
        )}

        <div>
          <TrackingKeyCopy trackingKey={project.trackingKey} />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" /> {eventsCount ?? 0} eventos
          </span>
          <span className="inline-flex items-center gap-1">
            <UserPlus className="h-3.5 w-3.5" /> {leadsCount ?? 0} leads
          </span>
          <span className="inline-flex items-center gap-1">
            <ShoppingBag className="h-3.5 w-3.5" /> {purchasesCount ?? 0} compras
          </span>
          {created && <span className="ml-auto">Criado em {created}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
