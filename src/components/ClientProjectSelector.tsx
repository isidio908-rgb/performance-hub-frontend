import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { clientsApi } from "@/api/clients";
import { projectsApi } from "@/api/projects";
import { useSelection } from "@/providers/SelectionProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client, Project } from "@/types";

function normalize<T>(res: T[] | { data: T[] } | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export function ClientProjectSelector() {
  const { clientId, projectId, setClientId, setProjectId } = useSelection();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.list(),
  });
  const clients = useMemo(
    () => normalize<Client>(clientsQuery.data),
    [clientsQuery.data],
  );

  const projectsQuery = useQuery({
    queryKey: ["projects", clientId],
    queryFn: () => projectsApi.list(clientId ?? undefined),
    enabled: !!clientId,
  });
  const projects = useMemo(
    () => normalize<Project>(projectsQuery.data),
    [projectsQuery.data],
  );

  // Auto-select first client/project when data loads and nothing selected.
  useEffect(() => {
    if (!clientId && clients[0]) setClientId(clients[0].id);
  }, [clientId, clients, setClientId]);

  useEffect(() => {
    if (clientId && !projectId && projects[0]) setProjectId(projects[0].id);
  }, [clientId, projectId, projects, setProjectId]);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={clientId ?? undefined}
        onValueChange={(v) => setClientId(v)}
        disabled={clientsQuery.isLoading}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue
            placeholder={clientsQuery.isError ? "Erro ao carregar" : "Cliente"}
          />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
          {clients.length === 0 && !clientsQuery.isLoading && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Nenhum cliente
            </div>
          )}
        </SelectContent>
      </Select>

      <Select
        value={projectId ?? undefined}
        onValueChange={(v) => setProjectId(v)}
        disabled={!clientId || projectsQuery.isLoading}
      >
        <SelectTrigger className="h-9 w-[200px]">
          <SelectValue placeholder="Projeto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
          {projects.length === 0 && clientId && !projectsQuery.isLoading && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Nenhum projeto
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
