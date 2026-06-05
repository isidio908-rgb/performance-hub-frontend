import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useSelection } from "@/providers/SelectionProvider";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Project, ProjectStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { clientId, setClientId, projectId, setProjectId } = useSelection();
  const { clients } = useClients();
  const { projectsQuery, projects, createProject, updateProject, deleteProject } = useProjects();

  const [filterClientId, setFilterClientId] = useState<string>(clientId ?? "__all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    if (filterClientId === "__all") return projects;
    return projects.filter((p) => p.clientId === filterClientId);
  }, [projects, filterClientId]);

  const onCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Projetos"
        description="Configure projetos, atribuição e tracking key."
        actions={
          <Button onClick={onCreate} disabled={clients.length === 0}>
            <Plus className="mr-2 h-4 w-4" /> Novo projeto
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filterClientId}
          onValueChange={(v) => {
            setFilterClientId(v);
            if (v !== "__all") setClientId(v);
          }}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Todos os clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {projectsQuery.isError && <ApiEnvironmentAlert error={projectsQuery.error} />}

      {projectsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasClients={clients.length > 0} onCreate={onCreate} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              selected={p.id === projectId}
              onSelect={() => {
                setClientId(p.clientId);
                setProjectId(p.id);
                toast.success(`Projeto "${p.name}" selecionado`);
              }}
              onEdit={() => {
                setEditing(p);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(p)}
              onChangeStatus={async (status: ProjectStatus) => {
                try {
                  await updateProject.mutateAsync({
                    id: p.id,
                    input: { status },
                  });
                  toast.success(`Status atualizado para ${status}`);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Falha ao atualizar");
                }
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar projeto" : "Novo projeto"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize os dados do projeto."
                : "Crie um projeto para gerar a tracking key."}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            clients={clients}
            defaultClientId={filterClientId !== "__all" ? filterClientId : clientId}
            initial={editing ?? undefined}
            submitting={createProject.isPending || updateProject.isPending}
            onCancel={() => setFormOpen(false)}
            onSubmit={async (input) => {
              try {
                if (editing) {
                  await updateProject.mutateAsync({ id: editing.id, input });
                  toast.success("Projeto atualizado");
                } else {
                  const created = await createProject.mutateAsync(input);
                  toast.success("Projeto criado");
                  if (!projectId && created?.id) {
                    setClientId(input.clientId);
                    setProjectId(created.id);
                  }
                }
                setFormOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Falha ao salvar");
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <DeleteProjectDialog
        project={deleting}
        open={!!deleting}
        loading={deleteProject.isPending}
        onOpenChange={(o) => !o && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteProject.mutateAsync(deleting.id);
            toast.success("Projeto excluído");
            if (projectId === deleting.id) setProjectId(null);
            setDeleting(null);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Falha ao excluir");
          }
        }}
      />
    </div>
  );
}

function EmptyState({ hasClients, onCreate }: { hasClients: boolean; onCreate: () => void }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Nenhum projeto encontrado</CardTitle>
        <CardDescription>
          {hasClients
            ? "Crie um projeto para gerar a tracking key e começar a coletar eventos."
            : "Crie primeiro um cliente, depois adicione projetos."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreate} disabled={!hasClients}>
          <Plus className="mr-2 h-4 w-4" /> Criar projeto
        </Button>
      </CardContent>
    </Card>
  );
}
