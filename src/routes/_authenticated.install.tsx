import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { useSelection } from "@/providers/SelectionProvider";
import { projectsApi } from "@/api/projects";
import { buildTrackerScript, getTrackerScriptUrl } from "@/utils/tracker";
import type { Project } from "@/types";

export const Route = createFileRoute("/_authenticated/install")({
  component: InstallPage,
});

function normalize<T>(res: T[] | { data: T[] } | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

function InstallPage() {
  const { projectId } = useSelection();
  const [copied, setCopied] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list(),
  });

  const project = useMemo<Project | undefined>(() => {
    const list = normalize<Project>(projectsQuery.data);
    return list.find((p) => p.id === projectId);
  }, [projectsQuery.data, projectId]);

  const trackerUrl = getTrackerScriptUrl();
  const script = project?.trackingKey
    ? buildTrackerScript(project.trackingKey)
    : null;

  async function copy() {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Script copiado");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Instalação</h1>
        <p className="text-sm text-muted-foreground">
          Cole este script no <code>&lt;head&gt;</code> do site para começar a rastrear eventos.
        </p>
      </div>

      <ApiEnvironmentAlert />

      {!projectId && (
        <Alert>
          <AlertTitle>Selecione um projeto</AlertTitle>
          <AlertDescription>
            Use o seletor no topo para escolher o projeto a ser instalado.
          </AlertDescription>
        </Alert>
      )}

      {projectId && !project && !projectsQuery.isLoading && (
        <Alert>
          <AlertTitle>Projeto não encontrado</AlertTitle>
          <AlertDescription>
            O projeto selecionado não foi retornado pela API.
          </AlertDescription>
        </Alert>
      )}

      {project && !project.trackingKey && (
        <Alert variant="destructive">
          <AlertTitle>Sem tracking key</AlertTitle>
          <AlertDescription>
            Este projeto ainda não possui <code>trackingKey</code>. Gere uma no backend antes de instalar.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Script de instalação</CardTitle>
          <CardDescription>
            URL do tracker: <code className="font-mono">{trackerUrl ?? "(API não configurada)"}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
            {script ?? "<!-- Selecione um projeto com trackingKey -->"}
          </pre>
          <Button onClick={copy} disabled={!script} size="sm">
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copiar script
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
