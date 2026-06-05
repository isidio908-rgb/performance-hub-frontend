import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useSelection } from "@/providers/SelectionProvider";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useSystemDiagnostics } from "@/hooks/useSystemDiagnostics";
import { useProjectInstall } from "@/hooks/useProjectInstall";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useIntegrationConfigs } from "@/hooks/useIntegrationConfigs";
import { useIntegrationDeliveries } from "@/hooks/useIntegrations";
import { leadsApi } from "@/api/leads";
import { purchasesApi } from "@/api/purchases";
import { dashboardApi } from "@/api/dashboard";

const STORAGE_KEY = "vps_e2e_checklist";

export type ItemState = "auto-pass" | "auto-fail" | "manual" | "idle";

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  auto?: "pass" | "fail" | null;
  to?: string;
  actionLabel?: string;
}

interface PersistedState {
  manual: Record<string, boolean>;
}

function readPersisted(): PersistedState {
  if (typeof window === "undefined") return { manual: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { manual: {} };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return { manual: parsed.manual ?? {} };
  } catch {
    return { manual: {} };
  }
}

function writePersisted(s: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

const MANUAL_IDS = ["install-opened", "test-event", "retry-delivery", "logout-login"];

function countItems(res: unknown): number {
  if (!res) return 0;
  if (Array.isArray(res)) return res.length;
  if (typeof res === "object") {
    const r = res as Record<string, unknown>;
    if (Array.isArray(r.data)) return (r.data as unknown[]).length;
    if (Array.isArray(r.items)) return (r.items as unknown[]).length;
    if (typeof r.total === "number") return r.total;
  }
  return 0;
}

export function useE2EChecklist() {
  const { isAuthenticated, user } = useAuth();
  const { clientId, projectId } = useSelection();
  const { clients } = useClients();
  const { projects } = useProjects();
  const currentProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  );

  const { summary } = useSystemDiagnostics();
  const installQ = useProjectInstall(projectId);
  const onboardingQ = useOnboardingStatus();
  const integrationConfigs = useIntegrationConfigs(projectId);
  const deliveriesQ = useIntegrationDeliveries({
    projectId: projectId ?? undefined,
    page: 1,
    pageSize: 20,
  });

  const kpisQ = useQuery({
    queryKey: ["e2e", "kpis", projectId],
    queryFn: () => dashboardApi.kpis(projectId),
    enabled: !!projectId,
    retry: 0,
    staleTime: 30_000,
  });

  const leadsQ = useQuery({
    queryKey: ["e2e", "leads", projectId],
    queryFn: () => leadsApi.list({ projectId: projectId!, page: 1, pageSize: 1 }),
    enabled: !!projectId,
    retry: 0,
    staleTime: 30_000,
  });

  const purchasesQ = useQuery({
    queryKey: ["e2e", "purchases", projectId],
    queryFn: () => purchasesApi.list({ projectId: projectId!, page: 1, pageSize: 1 }),
    enabled: !!projectId,
    retry: 0,
    staleTime: 30_000,
  });

  const [state, setState] = useState<PersistedState>(() => readPersisted());

  useEffect(() => {
    writePersisted(state);
  }, [state]);

  const setManual = useCallback((id: string, value: boolean) => {
    setState((prev) => ({ ...prev, manual: { ...prev.manual, [id]: value } }));
  }, []);

  const reset = useCallback(() => {
    setState({ manual: {} });
  }, []);

  const markAllReviewed = useCallback(() => {
    setState((prev) => {
      const manual = { ...prev.manual };
      for (const id of MANUAL_IDS) manual[id] = true;
      return { manual };
    });
  }, []);

  const install = installQ.data;
  const onboarding = onboardingQ.data;
  const kpis = kpisQ.data;

  const leadsCount = countItems(leadsQ.data);
  const purchasesCount = countItems(purchasesQ.data);
  const deliveriesCount = deliveriesQ.deliveries.length;
  const hasErroredDelivery = (deliveriesQ.deliveries ?? []).some(
    (d) => d.status === "FAILED" || d.status === "RETRY" || d.status === "PENDING" || !!d.error,
  );

  const items: ChecklistItem[] = [
    {
      id: "login",
      title: "Login realizado",
      description: "Sessão ativa com usuário autenticado.",
      auto: isAuthenticated ? "pass" : "fail",
      to: isAuthenticated ? undefined : "/login",
      actionLabel: isAuthenticated ? undefined : "Ir para login",
    },
    {
      id: "client",
      title: "Cliente criado",
      description: "Pelo menos um cliente cadastrado.",
      auto: clients.length > 0 ? "pass" : "fail",
      to: "/clients",
      actionLabel: clients.length > 0 ? "Ver clientes" : "Criar cliente",
    },
    {
      id: "project",
      title: "Projeto criado",
      description: "Pelo menos um projeto cadastrado.",
      auto: projects.length > 0 ? "pass" : "fail",
      to: "/projects",
      actionLabel: projects.length > 0 ? "Ver projetos" : "Criar projeto",
    },
    {
      id: "project-selected",
      title: "Projeto selecionado",
      description: "Cliente e projeto escolhidos no seletor do topo.",
      auto: clientId && projectId ? "pass" : "fail",
    },
    {
      id: "tracking-key",
      title: "Tracking key disponível",
      description: "Projeto possui tracking key gerada.",
      auto: currentProject?.trackingKey ? "pass" : "fail",
      to: "/install",
      actionLabel: "Abrir instalação",
    },
    {
      id: "install-opened",
      title: "Script de instalação aberto/copiado",
      description: "Manual: confirme que copiou o snippet no site do cliente.",
      auto: null,
      to: "/install",
      actionLabel: "Abrir instalação",
    },
    {
      id: "test-event",
      title: "Evento teste enviado",
      description: "Manual: dispare o botão de teste em /install.",
      auto: null,
      to: "/install",
      actionLabel: "Enviar evento teste",
    },
    {
      id: "events-received",
      title: "Evento recebido no backend",
      description: "Backend já recebeu pelo menos um evento.",
      auto: install?.hasReceivedEvents ? "pass" : "fail",
      to: "/events",
      actionLabel: "Ver eventos",
    },
    {
      id: "dashboard-kpis",
      title: "Dashboard com KPIs atualizados",
      description: "Eventos contabilizados no /dashboard/kpis.",
      auto: kpis && (kpis.events ?? 0) > 0 ? "pass" : "fail",
      to: "/dashboard",
      actionLabel: "Abrir dashboard",
    },
    {
      id: "onboarding-sync",
      title: "Onboarding status sincronizado",
      description: "Endpoint /onboarding/status responde.",
      auto: onboarding ? "pass" : onboardingQ.isError ? "fail" : null,
    },
    {
      id: "lead",
      title: "Lead visível",
      description: "Opcional: se aplicável ao projeto.",
      auto: leadsCount > 0 ? "pass" : null,
      to: "/leads",
      actionLabel: "Ver leads",
    },
    {
      id: "purchase",
      title: "Compra visível",
      description: "Opcional: se o site tem e-commerce.",
      auto: purchasesCount > 0 ? "pass" : null,
      to: "/ecommerce",
      actionLabel: "Ver compras",
    },
    {
      id: "integration-config",
      title: "Configuração de integração criada",
      description: "Pelo menos um provedor configurado.",
      auto: integrationConfigs.configs.length > 0 ? "pass" : null,
      to: "/integrations",
      actionLabel: "Ver integrações",
    },
    {
      id: "deliveries",
      title: "Entregas de integração carregadas",
      description: "Lista de deliveries disponível para o projeto.",
      auto: deliveriesCount > 0 ? "pass" : deliveriesQ.isError ? "fail" : null,
      to: "/integrations",
      actionLabel: "Ver entregas",
    },
    {
      id: "retry-delivery",
      title: "Retry de entrega testado",
      description: hasErroredDelivery
        ? "Manual: existe delivery com erro — teste o reenvio."
        : "Manual: marcar quando aplicável.",
      auto: null,
      to: "/integrations",
      actionLabel: "Abrir integrações",
    },
    {
      id: "logout-login",
      title: "Logout/login validado",
      description: "Manual: encerre sessão e entre novamente.",
      auto: null,
      to: "/settings",
      actionLabel: "Configurações",
    },
  ];

  const resolved = items.map((item) => {
    const manualChecked = !!state.manual[item.id];
    let status: ItemState;
    if (item.auto === "pass") status = "auto-pass";
    else if (item.auto === "fail") status = "auto-fail";
    else if (manualChecked) status = "manual";
    else status = "idle";
    return {
      ...item,
      manualChecked,
      status,
      passed: status === "auto-pass" || status === "manual",
    };
  });

  const total = resolved.length;
  const passed = resolved.filter((i) => i.passed).length;
  const percent = total === 0 ? 0 : Math.round((passed / total) * 100);

  return {
    items: resolved,
    total,
    passed,
    percent,
    setManual,
    reset,
    markAllReviewed,
    diagnosticsSummary: summary,
    user,
  };
}
