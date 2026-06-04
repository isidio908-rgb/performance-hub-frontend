import { Building2, FolderKanban, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Client } from "@/types";

interface Props {
  client: Client;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return null;
  }
}

export function ClientCard({ client, selected, onSelect, onEdit, onDelete }: Props) {
  const projectsCount = client._count?.projects ?? client.projectsCount ?? undefined;
  const created = formatDate(client.createdAt);

  return (
    <Card
      className={`group transition-colors hover:border-primary/40 ${
        selected ? "border-primary/60 ring-1 ring-primary/30" : ""
      }`}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="flex flex-1 items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{client.name}</p>
              {client.document && (
                <p className="truncate text-xs text-muted-foreground">{client.document}</p>
              )}
            </div>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {client.notes && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{client.notes}</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FolderKanban className="h-3.5 w-3.5" />
            {projectsCount ?? 0} projeto{projectsCount === 1 ? "" : "s"}
          </span>
          {created && <span>Criado em {created}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
