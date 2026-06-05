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
  const clients = useMemo(() => normalize<Client>(clientsQuery.data), [clientsQuery.data]);

  // Backend atual NÃO filtra por clientId: buscamos todos e filtramos aqui.
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list(),
  });
  const allProjects = useMemo(() => normalize<Project>(projectsQuery.data), [projectsQuery.data]);
  const projects = useMemo(
    () => (clientId ? allProjects.filter((p) => p.clientId === clientId) : []),
    [allProjects, clientId],
  );

  // Auto-seleciona primeiro cliente disponível.
  useEffect(() => {
    if (!clientId && clients[0]) setClientId(clients[0].id);
  }, [clientId, clients, setClientId]);

  // Auto-seleciona primeiro projeto válido para o cliente atual.
  // Se o projeto persistido não pertence ao cliente atual, reseta.
  useEffect(() => {
    if (!clientId) return;
    if (projectsQuery.isLoading) return;
    if (projectId && projects.some((p) => p.id === projectId)) return;
    setProjectId(projects[0]?.id ?? null);
  }, [clientId, projectId, projects, projectsQuery.isLoading, setProjectId]);

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <Select
        value={clientId ?? undefined}
        onValueChange={(v) => {
          setClientId(v);
          setProjectId(null); // limpar projeto ao trocar cliente
        }}
        disabled={clientsQuery.isLoading}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue
            placeholder={
              clientsQuery.isLoading ? "Carregando..." : clientsQuery.isError ? "Erro" : "Cliente"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
          {clients.length === 0 && !clientsQuery.isLoading && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Nenhum cliente</div>
          )}
        </SelectContent>
      </Select>

      <Select
        value={projectId ?? undefined}
        onValueChange={(v) => setProjectId(v)}
        disabled={!clientId || projectsQuery.isLoading}
      >
        <SelectTrigger className="h-9 w-[200px]">
          <SelectValue placeholder={projectsQuery.isLoading ? "Carregando..." : "Projeto"} />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
          {projects.length === 0 && clientId && !projectsQuery.isLoading && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Nenhum projeto</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
