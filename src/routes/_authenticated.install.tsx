import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Copy,
  Check,
  Globe,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectHealthBadge } from "@/components/projects/ProjectHealthBadge";
import { TrackingKeyCopy } from "@/components/projects/TrackingKeyCopy";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { useSelection } from "@/providers/SelectionProvider";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { buildTrackerScript, getTrackerScriptUrl } from "@/utils/tracker";
import { dashboardApi } from "@/api/dashboard";
import { buildOnboardingState, markScriptCopied, wasScriptCopied } from "@/utils/onboarding";
import { cn } from "@/lib/utils";
import { useProjectInstall, useSendTestEvent } from "@/hooks/useProjectInstall";
import { PageHeader } from "@/components/layout/PageHeader";

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
    queryKey: ["dashboard", "kpis", projectId],
    queryFn: () => dashboardApi.kpis(projectId),
    enabled: !!projectId,
    retry: 1,
  });

  // Endpoint oficial V3.4 — fonte preferida para script/tracking.
  const installInfoQ = useProjectInstall(projectId);
  const sendTestEvent = useSendTestEvent();

  useEffect(() => {
    setCopiedFlag(wasScriptCopied(projectId));
  }, [projectId]);

  const fallbackUrl = getTrackerScriptUrl();
  const fallbackScript = project?.trackingKey ? buildTrackerScript(project.trackingKey) : null;

  // Preferir dados do backend; se faltar, cair para fallback local.
  const trackerUrl = installInfoQ.data?.trackerUrl ?? fallbackUrl;
  const script = installInfoQ.data?.scriptTag ?? fallbackScript;
  const trackingKey = installInfoQ.data?.trackingKey ?? project?.trackingKey;
  const domain = installInfoQ.data?.domain ?? project?.domain;
  const lastEventAt = installInfoQ.data?.lastEventAt;
  const backendHasEvents = installInfoQ.data?.hasReceivedEvents;

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

  async function handleSendTestEvent() {
    if (!projectId) return;
    try {
      await sendTestEvent.mutateAsync(projectId);
      toast.success("Evento de teste enviado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar evento");
    }
  }

  const hasEvents =
    backendHasEvents ?? ((kpisQuery.data?.events ?? 0) > 0 || (kpisQuery.data?.pageViews ?? 0) > 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Instalação do tracking"
        description={
          <>
            Cole este script no <code>&lt;head&gt;</code> do site para começar a rastrear eventos.
          </>
        }
      />

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
              {installInfoQ.data?.projectName ?? project.name}
              <ProjectStatusBadge status={project.status} />
              <ProjectHealthBadge projectId={projectId} compact />
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3">
              {domain && (
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> {domain}
                </span>
              )}
              <TrackingKeyCopy trackingKey={trackingKey} />
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {project && !trackingKey && (
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
            <CardDescription>
              Acompanhe o progresso da instalação deste projeto.
              {lastEventAt && (
                <>
                  {" "}
                  Último evento recebido em{" "}
                  <strong>{new Date(lastEventAt).toLocaleString("pt-BR")}</strong>.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <StatusRow done={!!trackingKey} label="Tracking key disponível" />
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
            {installInfoQ.isError && (
              <span className="ml-2 text-xs text-muted-foreground">
                (usando script local — endpoint /install indisponível)
              </span>
            )}
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
              <Button
                onClick={handleSendTestEvent}
                size="sm"
                variant="outline"
                disabled={!projectId || sendTestEvent.isPending}
              >
                {sendTestEvent.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar evento teste
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
    <li className="flex items-center gap-2.5 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
      ) : pending ? (
        <Clock className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>{label}</span>
    </li>
  );
}

function ScriptBlock({ script }: { script: string | null }) {
  return (
    <div className="group relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-1.5 rounded-t-md border-b border-border/40 bg-muted/50 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-destructive/60" />
        <span className="h-2 w-2 rounded-full bg-warning/60" />
        <span className="h-2 w-2 rounded-full bg-success/60" />
        <span className="ml-2 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          tracker.js
        </span>
      </div>
      <pre className="overflow-x-auto rounded-md border border-border/60 bg-background/60 pb-3 pl-3 pr-3 pt-10 font-mono text-xs leading-relaxed text-foreground/90 shadow-inner">
        <code>{script ?? "<!-- Selecione um projeto com trackingKey -->"}</code>
      </pre>
    </div>
  );
}
