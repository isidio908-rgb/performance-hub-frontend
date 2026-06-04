import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Globe, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { TrackingKeyCopy } from "@/components/projects/TrackingKeyCopy";
import { useSelection } from "@/providers/SelectionProvider";
import { useProjects } from "@/hooks/useProjects";
import { buildTrackerScript, getTrackerScriptUrl } from "@/utils/tracker";

export const Route = createFileRoute("/_authenticated/install")({
  component: InstallPage,
});

function InstallPage() {
  const { projectId } = useSelection();
  const { projects, projectsQuery } = useProjects();
  const [copied, setCopied] = useState(false);

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);

  const trackerUrl = getTrackerScriptUrl();
  const script = project?.trackingKey ? buildTrackerScript(project.trackingKey) : null;

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

      {!projectId ? (
        <Alert>
          <AlertTitle>Nenhum projeto selecionado</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-2">
            <span>Selecione um projeto no topo ou crie um novo.</span>
            <Button asChild variant="outline" size="sm">
              <Link to="/projects">
                Ir para Projetos <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : !project && !projectsQuery.isLoading ? (
        <Alert>
          <AlertTitle>Projeto não encontrado</AlertTitle>
          <AlertDescription>O projeto selecionado não foi retornado pela API.</AlertDescription>
        </Alert>
      ) : null}

      {project && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {project.name}
              <ProjectStatusBadge status={project.status} />
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3">
              {project.domain && (
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> {project.domain}
                </span>
              )}
              <TrackingKeyCopy trackingKey={project.trackingKey} />
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {project && !project.trackingKey && (
        <Alert variant="destructive">
          <AlertTitle>Sem tracking key</AlertTitle>
          <AlertDescription>
            Este projeto ainda não possui <code>trackingKey</code>. Gere uma no backend antes de
            instalar.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Script de instalação</CardTitle>
          <CardDescription>
            URL do tracker:{" "}
            <code className="font-mono">{trackerUrl ?? "(API não configurada)"}</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="site">
            <TabsList>
              <TabsTrigger value="site">Site próprio</TabsTrigger>
              <TabsTrigger value="gtm">GTM</TabsTrigger>
              <TabsTrigger value="shopify">Shopify</TabsTrigger>
              <TabsTrigger value="woo">WooCommerce</TabsTrigger>
            </TabsList>

            <TabsContent value="site" className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Cole dentro da tag <code>&lt;head&gt;</code> de todas as páginas.
              </p>
              <ScriptBlock script={script} />
            </TabsContent>

            <TabsContent value="gtm" className="space-y-3">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  No GTM, crie uma <strong>Tag</strong> do tipo <em>HTML Customizado</em>.
                </li>
                <li>Cole o script abaixo no conteúdo da tag.</li>
                <li>
                  Defina o acionador como <em>All Pages</em> e publique o container.
                </li>
              </ol>
              <ScriptBlock script={script} />
            </TabsContent>

            <TabsContent value="shopify" className="space-y-3">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  Admin Shopify → <strong>Loja online</strong> → <strong>Temas</strong> →{" "}
                  <em>Editar código</em>.
                </li>
                <li>
                  Abra <code>theme.liquid</code> e cole o script antes de <code>&lt;/head&gt;</code>
                  .
                </li>
                <li>Salve. O script começará a coletar eventos automaticamente.</li>
              </ol>
              <ScriptBlock script={script} />
            </TabsContent>

            <TabsContent value="woo" className="space-y-3">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  Instale um plugin de injeção de scripts (ex.: <em>WPCode</em>).
                </li>
                <li>
                  Crie um snippet do tipo <strong>Header</strong> e cole o script.
                </li>
                <li>Ative o snippet em todo o site.</li>
              </ol>
              <ScriptBlock script={script} />
            </TabsContent>
          </Tabs>

          {script && (
            <div className="mt-4">
              <Button onClick={copy} size="sm">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                Copiar script
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScriptBlock({ script }: { script: string | null }) {
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
      {script ?? "<!-- Selecione um projeto com trackingKey -->"}
    </pre>
  );
}
