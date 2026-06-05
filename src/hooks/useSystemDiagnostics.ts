import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { systemApi } from "@/api/system";
import { authApi } from "@/api/auth";
import { bootstrapApi } from "@/api/bootstrap";
import { onboardingApi } from "@/api/onboarding";
import { installApi } from "@/api/install";
import { projectHealthApi } from "@/api/projectHealth";
import { integrationsApi } from "@/api/integrations";
import { eventsApi, normalizeEvents } from "@/api/events";
import { tokenStorage, ApiError } from "@/api/client";
import { useAuth } from "@/providers/AuthProvider";
import { useSelection } from "@/providers/SelectionProvider";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { getApiEnvironmentStatus } from "@/utils/runtime";

export type DiagnosticStatus = "success" | "warning" | "error" | "pending" | "idle";

export interface DiagnosticCheck {
  id: string;
  label: string;
  description?: string;
  status: DiagnosticStatus;
  detail?: string;
  actionLabel?: string;
  actionTo?: string;
}

export interface DiagnosticSection {
  id: string;
  title: string;
  description?: string;
  checks: DiagnosticCheck[];
}

export interface DiagnosticsSummary {
  total: number;
  success: number;
  warning: number;
  error: number;
  pending: number;
  overall: DiagnosticStatus;
  successRate: number;
}

export interface UseSystemDiagnosticsOptions {
  /** Quando definido (>0), as queries usam refetchInterval. */
  refetchIntervalMs?: number;
}

export interface SystemDiagnosticsResult {
  sections: DiagnosticSection[];
  summary: DiagnosticsSummary;
  isFetching: boolean;
  refetchAll: () => void;
  lastCheckedAt: number | null;
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.kind === "missing_base_url") return "API não configurada (VITE_API_BASE_URL)";
    if (err.kind === "mixed_content") return "Mixed content: API HTTP em página HTTPS";
    if (err.kind === "network") return `Falha de rede: ${err.message}`;
    return `HTTP ${err.status}: ${err.message}`;
  }
  if (err instanceof Error) return err.message;
  return "Erro desconhecido";
}

function fromQuery(
  q: { isLoading: boolean; isError: boolean; data: unknown; error: unknown },
  okDetail?: string,
): { status: DiagnosticStatus; detail?: string } {
  if (q.isLoading) return { status: "pending", detail: "Verificando…" };
  if (q.isError) return { status: "error", detail: describeError(q.error) };
  return { status: "success", detail: okDetail };
}

export function useSystemDiagnostics(
  options: UseSystemDiagnosticsOptions = {},
): SystemDiagnosticsResult {
  const refetchInterval =
    options.refetchIntervalMs && options.refetchIntervalMs > 0
      ? options.refetchIntervalMs
      : (false as const);

  const env = getApiEnvironmentStatus();
  const { user, isAuthenticated } = useAuth();
  const { clientId, projectId } = useSelection();
  const { clients } = useClients();
  const { projects } = useProjects();

  const currentProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  );

  const canCallApi = env.configured && !env.mixedContent;

  const baseOpts = {
    retry: 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval,
  } as const;

  const healthQ = useQuery({
    queryKey: ["system", "health"],
    queryFn: () => systemApi.health(),
    enabled: canCallApi,
    ...baseOpts,
  });

  const meQ = useQuery({
    queryKey: ["system", "me"],
    queryFn: () => authApi.me(),
    enabled: canCallApi && !!tokenStorage.access,
    ...baseOpts,
  });

  const bootstrapQ = useQuery({
    queryKey: ["system", "bootstrap"],
    queryFn: () => bootstrapApi.get(),
    enabled: canCallApi && !!tokenStorage.access,
    ...baseOpts,
  });

  const onboardingQ = useQuery({
    queryKey: ["system", "onboarding"],
    queryFn: () => onboardingApi.status(),
    enabled: canCallApi && !!tokenStorage.access,
    ...baseOpts,
  });

  const installQ = useQuery({
    queryKey: ["system", "install", projectId],
    queryFn: () => installApi.info(projectId!),
    enabled: canCallApi && !!projectId,
    ...baseOpts,
  });

  const projectHealthQ = useQuery({
    queryKey: ["system", "projectHealth", projectId],
    queryFn: () => projectHealthApi.get(projectId!),
    enabled: canCallApi && !!projectId,
    ...baseOpts,
  });

  const eventsQ = useQuery({
    queryKey: ["system", "events", projectId],
    queryFn: () => eventsApi.list({ projectId: projectId!, page: 1, pageSize: 1 }),
    enabled: canCallApi && !!projectId,
    ...baseOpts,
  });

  const integrationsHealthQ = useQuery({
    queryKey: ["system", "integrations", "health", projectId],
    queryFn: () => integrationsApi.health(projectId ?? undefined),
    enabled: canCallApi && !!tokenStorage.access,
    ...baseOpts,
  });

  const deliveriesQ = useQuery({
    queryKey: ["system", "integrations", "deliveries", projectId],
    queryFn: () =>
      integrationsApi.deliveries({
        projectId: projectId ?? undefined,
        page: 1,
        pageSize: 1,
      }),
    enabled: canCallApi && !!projectId,
    ...baseOpts,
  });

  const sections: DiagnosticSection[] = useMemo(() => {
    const list: DiagnosticSection[] = [];

    // 1. Ambiente
    const envChecks: DiagnosticCheck[] = [
      {
        id: "env.baseUrl",
        label: "VITE_API_BASE_URL",
        status: env.configured ? "success" : "error",
        detail: env.configured ? env.baseUrl : "Variável não definida no .env",
        actionLabel: env.configured ? undefined : "Configurações",
        actionTo: env.configured ? undefined : "/settings",
      },
      {
        id: "env.https",
        label: "API em HTTPS",
        status: !env.configured
          ? "idle"
          : env.httpApi
            ? env.mixedContent
              ? "error"
              : "warning"
            : "success",
        detail: !env.configured
          ? "Aguardando configuração"
          : env.mixedContent
            ? "Mixed content: página HTTPS chamando API HTTP"
            : env.httpApi
              ? "API em HTTP — funciona em dev, não em produção"
              : "TLS ativo",
      },
      {
        id: "env.app",
        label: "Domínio do app",
        status: "success",
        detail:
          typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.host}`
            : "—",
      },
    ];
    list.push({
      id: "environment",
      title: "Ambiente",
      description: "Configuração do frontend e da URL da API.",
      checks: envChecks,
    });

    // 2. Sessão
    const sessionChecks: DiagnosticCheck[] = [
      {
        id: "session.token",
        label: "Access token presente",
        status: tokenStorage.access ? "success" : "error",
        detail: tokenStorage.access ? "Token em localStorage" : "Faça login",
        actionLabel: tokenStorage.access ? undefined : "Ir para login",
        actionTo: tokenStorage.access ? undefined : "/login",
      },
      {
        id: "session.user",
        label: "Usuário autenticado",
        status: isAuthenticated ? "success" : "error",
        detail: isAuthenticated ? `${user?.name ?? user?.email ?? "—"}` : "Sessão ausente",
      },
      {
        id: "session.me",
        label: "GET /me",
        ...fromQuery(meQ, meQ.data ? `Olá, ${meQ.data.name ?? meQ.data.email}` : undefined),
      },
    ];
    list.push({
      id: "session",
      title: "Sessão",
      description: "Token, usuário e endpoint /me.",
      checks: sessionChecks,
    });

    // 3. Bootstrap
    const bootstrap = bootstrapQ.data;
    const bootstrapBase = fromQuery(bootstrapQ);
    const bootstrapChecks: DiagnosticCheck[] = [
      {
        id: "bootstrap.endpoint",
        label: "GET /app/bootstrap",
        ...bootstrapBase,
      },
      {
        id: "bootstrap.clients",
        label: "Clientes carregados",
        status: clients.length
          ? "success"
          : bootstrapBase.status === "pending"
            ? "pending"
            : "warning",
        detail: clients.length ? `${clients.length} cliente(s)` : "Nenhum cliente cadastrado",
        actionLabel: clients.length ? undefined : "Criar cliente",
        actionTo: clients.length ? undefined : "/clients",
      },
      {
        id: "bootstrap.projects",
        label: "Projetos carregados",
        status: projects.length
          ? "success"
          : bootstrapBase.status === "pending"
            ? "pending"
            : "warning",
        detail: projects.length ? `${projects.length} projeto(s)` : "Nenhum projeto cadastrado",
        actionLabel: projects.length ? undefined : "Criar projeto",
        actionTo: projects.length ? undefined : "/projects",
      },
    ];
    if (bootstrap?.user) {
      bootstrapChecks[0].detail = `Bootstrap ok (${bootstrap.user.email})`;
    }
    list.push({
      id: "bootstrap",
      title: "Bootstrap",
      description: "Dados agregados de inicialização do app.",
      checks: bootstrapChecks,
    });

    // 4. Projeto atual
    const projChecks: DiagnosticCheck[] = [
      {
        id: "project.client",
        label: "Cliente selecionado",
        status: clientId ? "success" : "warning",
        detail: clientId
          ? (clients.find((c) => c.id === clientId)?.name ?? clientId)
          : "Selecione um cliente no topo",
      },
      {
        id: "project.project",
        label: "Projeto selecionado",
        status: projectId ? "success" : "warning",
        detail: projectId ? (currentProject?.name ?? projectId) : "Selecione um projeto no topo",
      },
      {
        id: "project.trackingKey",
        label: "Tracking key",
        status: currentProject?.trackingKey ? "success" : projectId ? "warning" : "idle",
        detail: currentProject?.trackingKey
          ? currentProject.trackingKey
          : projectId
            ? "Tracking key indisponível"
            : "Aguardando projeto",
      },
      {
        id: "project.health",
        label: "GET /projects/:id/health",
        ...(projectId
          ? fromQuery(
              projectHealthQ,
              projectHealthQ.data?.status ? `Status: ${projectHealthQ.data.status}` : undefined,
            )
          : { status: "idle" as DiagnosticStatus, detail: "Aguardando projeto" }),
      },
      {
        id: "project.install",
        label: "GET /projects/:id/install",
        ...(projectId
          ? fromQuery(installQ, installQ.data ? "Dados de instalação ok" : undefined)
          : { status: "idle" as DiagnosticStatus, detail: "Aguardando projeto" }),
      },
    ];
    list.push({
      id: "project",
      title: "Projeto atual",
      description: "Cliente/projeto selecionados e healthchecks.",
      checks: projChecks,
    });

    // 5. Tracking
    const install = installQ.data;
    const eventsCount = normalizeEvents(eventsQ.data).length;
    const trackingChecks: DiagnosticCheck[] = [
      {
        id: "tracking.script",
        label: "Script tag",
        status: install?.scriptTag
          ? "success"
          : projectId
            ? installQ.isLoading
              ? "pending"
              : "warning"
            : "idle",
        detail: install?.scriptTag ? "Snippet disponível" : "Snippet não disponível",
        actionLabel: projectId ? "Instalar tracking" : undefined,
        actionTo: projectId ? "/install" : undefined,
      },
      {
        id: "tracking.received",
        label: "Eventos recebidos pelo backend",
        status:
          install?.hasReceivedEvents === true
            ? "success"
            : install?.hasReceivedEvents === false
              ? "warning"
              : "idle",
        detail:
          install?.hasReceivedEvents === true
            ? install?.lastEventAt
              ? `Último: ${new Date(install.lastEventAt).toLocaleString("pt-BR")}`
              : "Sim"
            : install?.hasReceivedEvents === false
              ? "Nenhum evento recebido ainda"
              : "Desconhecido",
      },
      {
        id: "tracking.events",
        label: "GET /analytics/events",
        ...(projectId
          ? fromQuery(
              eventsQ,
              eventsCount > 0 ? `${eventsCount} evento(s) recente(s)` : "Sem eventos recentes",
            )
          : { status: "idle" as DiagnosticStatus, detail: "Aguardando projeto" }),
        actionLabel: projectId ? "Ver eventos" : undefined,
        actionTo: projectId ? "/events" : undefined,
      },
    ];
    list.push({
      id: "tracking",
      title: "Tracking",
      description: "Snippet, recebimento e eventos recentes.",
      checks: trackingChecks,
    });

    // 6. Onboarding
    const onboardingChecks: DiagnosticCheck[] = [
      {
        id: "onboarding.endpoint",
        label: "GET /onboarding/status",
        ...fromQuery(
          onboardingQ,
          onboardingQ.data?.nextStep ? `Próximo passo: ${onboardingQ.data.nextStep}` : undefined,
        ),
      },
      {
        id: "onboarding.nextStep",
        label: "Próximo passo",
        status: onboardingQ.data?.nextStep
          ? "success"
          : onboardingQ.isLoading
            ? "pending"
            : "warning",
        detail: onboardingQ.data?.nextStep ?? "Indisponível",
      },
    ];
    list.push({
      id: "onboarding",
      title: "Onboarding",
      description: "Estado do fluxo de configuração inicial.",
      checks: onboardingChecks,
    });

    // 7. Integrações
    const intHealth = integrationsHealthQ.data ?? [];
    const downCount = intHealth.filter((i) => i.status === "DOWN" || i.healthy === false).length;
    const integrationChecks: DiagnosticCheck[] = [
      {
        id: "integrations.health",
        label: "GET /integrations/health",
        ...fromQuery(
          integrationsHealthQ,
          intHealth.length
            ? `${intHealth.length} integração(ões)${downCount ? `, ${downCount} com falha` : ""}`
            : "Sem integrações configuradas",
        ),
        actionLabel: "Ver integrações",
        actionTo: "/integrations",
      },
      {
        id: "integrations.deliveries",
        label: "GET /integrations/deliveries",
        ...(projectId
          ? fromQuery(deliveriesQ, "Entregas acessíveis")
          : { status: "idle" as DiagnosticStatus, detail: "Aguardando projeto" }),
      },
    ];
    if (downCount > 0) {
      integrationChecks[0].status = "warning";
    }
    list.push({
      id: "integrations",
      title: "Integrações",
      description: "Saúde dos provedores e fila de entregas.",
      checks: integrationChecks,
    });

    return list;
  }, [
    env,
    user,
    isAuthenticated,
    clientId,
    projectId,
    clients,
    projects,
    currentProject,
    meQ,
    bootstrapQ,
    onboardingQ,
    installQ,
    projectHealthQ,
    eventsQ,
    integrationsHealthQ,
    deliveriesQ,
  ]);

  const summary = useMemo<DiagnosticsSummary>(() => {
    let success = 0,
      warning = 0,
      error = 0,
      pending = 0,
      total = 0;
    for (const s of sections)
      for (const c of s.checks) {
        total++;
        if (c.status === "success") success++;
        else if (c.status === "warning") warning++;
        else if (c.status === "error") error++;
        else if (c.status === "pending") pending++;
      }
    const overall: DiagnosticStatus = error
      ? "error"
      : warning
        ? "warning"
        : pending
          ? "pending"
          : "success";
    const successRate = total === 0 ? 0 : Math.round((success / total) * 100);
    return { total, success, warning, error, pending, overall, successRate };
  }, [sections]);

  const isFetching =
    healthQ.isFetching ||
    meQ.isFetching ||
    bootstrapQ.isFetching ||
    onboardingQ.isFetching ||
    installQ.isFetching ||
    projectHealthQ.isFetching ||
    eventsQ.isFetching ||
    integrationsHealthQ.isFetching ||
    deliveriesQ.isFetching;

  const lastCheckedAt = useMemo(() => {
    const times = [
      healthQ.dataUpdatedAt,
      meQ.dataUpdatedAt,
      bootstrapQ.dataUpdatedAt,
      onboardingQ.dataUpdatedAt,
      installQ.dataUpdatedAt,
      projectHealthQ.dataUpdatedAt,
      eventsQ.dataUpdatedAt,
      integrationsHealthQ.dataUpdatedAt,
      deliveriesQ.dataUpdatedAt,
    ].filter((t) => typeof t === "number" && t > 0);
    return times.length ? Math.max(...times) : null;
  }, [
    healthQ.dataUpdatedAt,
    meQ.dataUpdatedAt,
    bootstrapQ.dataUpdatedAt,
    onboardingQ.dataUpdatedAt,
    installQ.dataUpdatedAt,
    projectHealthQ.dataUpdatedAt,
    eventsQ.dataUpdatedAt,
    integrationsHealthQ.dataUpdatedAt,
    deliveriesQ.dataUpdatedAt,
  ]);

  const refetchAll = () => {
    healthQ.refetch();
    meQ.refetch();
    bootstrapQ.refetch();
    onboardingQ.refetch();
    installQ.refetch();
    projectHealthQ.refetch();
    eventsQ.refetch();
    integrationsHealthQ.refetch();
    deliveriesQ.refetch();
  };

  return { sections, summary, isFetching, refetchAll, lastCheckedAt };
}
