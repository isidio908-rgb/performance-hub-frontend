import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IntegrationConfig } from "@/api/integrationConfigs";

interface Props {
  configs: IntegrationConfig[];
  onEdit: (config: IntegrationConfig) => void;
  onDelete: (config: IntegrationConfig) => void;
}

function statusVariant(status?: string): "success" | "warning" | "muted" | "outline" {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "success";
    case "PAUSED":
      return "warning";
    case "INACTIVE":
      return "muted";
    default:
      return "outline";
  }
}

export function IntegrationConfigsTable({ configs, onEdit, onDelete }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Provider</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Atualizado em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configs.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-mono text-xs">{c.provider}</TableCell>
            <TableCell>{c.name ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(c.status)}>{c.status ?? "—"}</Badge>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {c.updatedAt ? new Date(c.updatedAt).toLocaleString("pt-BR") : "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="inline-flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(c)}
                  aria-label={`Editar configuração ${c.provider}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(c)}
                  aria-label={`Excluir configuração ${c.provider}`}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
