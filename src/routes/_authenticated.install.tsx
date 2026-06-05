import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Globe, ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { TrackingKeyCopy } from "@/components/projects/TrackingKeyCopy";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { useSelection } from "@/providers/SelectionProvider";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { buildTrackerScript, getTrackerScriptUrl } from "@/utils/tracker";
import { dashboardApi } from "@/api/dashboard";
import { buildOnboardingState, markScriptCopied, wasScriptCopied } from "@/utils/onboarding";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/install")({
  component: InstallPage,
});

function InstallPage() {
  const { projectId } = useSelection();
  const { clients } = useClients();
  const { projects, projectsQuery } = useProjects();
  const [copied, setCopied] = useState(false);
  const [copiedFlag, setCopiedFlag] = useState(false);

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);

  const kpisQuery = useQuery({
    queryKey: ["analytics", "overview", projectId],
    queryFn: () => dashboardApi.overview(projectId!),
    enabled: !!projectId,
    retry: 1,
  });

  useEffect(() => {
    setCopiedFlag(wasScriptCopied(projectId));
  }, [projectId]);

  const trackerUrl = getTrackerScriptUrl();
  const script = project?.trackingKey ? buildTrackerScript(project.trackingKey) : null;

  const onboardingState = buildOnboardingState({
    clients,
    projects,
    currentProject: project,
    kpis: kpisQuery.data,
    projectId,
  });

  async function copy() {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Script copiado");
    setTimeout(() => setCopied(false), 1500);
  }

  function markCopied() {
    if (!projectId) return;
    markScriptCopied(projectId);
    setCopiedFlag(true);
    toast.success("Marcado como instalado");
  }

  const hasEvents = (kpisQuery.data?.events ?? 0) > 0 || (kpisQuery.data?.pageViews ?? 0) > 0;

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

      {projectId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status esperado</CardTitle>
            <CardDescription>Acompanhe o progresso da instalação deste projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <StatusRow done={!!project?.trackingKey} label="Tracking key disponível" />
              <StatusRow done={!!script} label="Script gerado" />
              <StatusRow done={copiedFlag} label="Script copiado / instalação confirmada" />
              <StatusRow
                done={hasEvents}
                pending={!hasEvents && copiedFlag}
                label={
                  hasEvents
                    ? "Eventos detectados"
                    : copiedFlag
                      ? "Aguardando primeiro evento"
                      : "Primeiro evento ainda não recebido"
                }
              />
            </ul>
          </CardContent>
        </Card>
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
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={copy} size="sm">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                Copiar script
              </Button>
              <Button
                onClick={markCopied}
                size="sm"
                variant={copiedFlag ? "outline" : "secondary"}
                disabled={!projectId}
              >
                {copiedFlag ? <Check className="mr-2 h-4 w-4" /> : null}
                {copiedFlag ? "Marcado como instalado" : "Copiei o script"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validação do tracker</CardTitle>
          <CardDescription>
            Próximos passos para confirmar que tudo está funcionando.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Script instalado no <code>&lt;head&gt;</code> do site.
            </li>
            <li>
              Abra o site em uma aba anônima para gerar um <strong>PageView</strong>.
            </li>
            <li>
              Verifique a chegada do evento em{" "}
              <Link to="/events" className="text-primary underline">
                Eventos
              </Link>
              .
            </li>
            <li>
              Configure eventos de <strong>Lead</strong> e <strong>Purchase</strong> conforme a
              documentação.
            </li>
          </ol>
          <Button asChild size="sm" variant="outline">
            <Link to="/events">
              Ir para Eventos <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {projectId && <OnboardingChecklist state={onboardingState} />}
    </div>
  );
}

function StatusRow({ done, pending, label }: { done: boolean; pending?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : pending ? (
        <Clock className="h-4 w-4 text-amber-500" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>{label}</span>
    </li>
  );
}

function ScriptBlock({ script }: { script: string | null }) {
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
      {script ?? "<!-- Selecione um projeto com trackingKey -->"}
    </pre>
  );
}
