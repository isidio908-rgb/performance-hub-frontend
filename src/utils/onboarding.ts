import type { Client, Project, DashboardKpis } from "@/types";

const COPIED_PREFIX = "vps_tracker_script_copied_";

export interface OnboardingState {
  hasClient: boolean;
  hasProject: boolean;
  hasTrackingKey: boolean;
  scriptCopied: boolean;
  hasEvents: boolean;
  hasLeads: boolean;
  hasPurchases: boolean;
}

export interface OnboardingStep {
  id: keyof OnboardingState;
  label: string;
  description: string;
  to: string;
  actionLabel: string;
  done: boolean;
}

export function hasClient(clients: Client[]): boolean {
  return clients.length > 0;
}

export function hasProject(projects: Project[]): boolean {
  return projects.length > 0;
}

export function hasTrackingKey(project: Project | undefined | null): boolean {
  return !!project?.trackingKey;
}

export function hasEvents(kpis: DashboardKpis | undefined | null): boolean {
  return (kpis?.events ?? 0) > 0 || (kpis?.pageViews ?? 0) > 0;
}

export function hasLeads(kpis: DashboardKpis | undefined | null): boolean {
  return (kpis?.leads ?? 0) > 0;
}

export function hasPurchases(kpis: DashboardKpis | undefined | null): boolean {
  return (kpis?.purchases ?? 0) > 0;
}

export function markScriptCopied(projectId: string): void {
  try {
    localStorage.setItem(`${COPIED_PREFIX}${projectId}`, "true");
  } catch {
    /* ignore */
  }
}

export function wasScriptCopied(projectId: string | null | undefined): boolean {
  if (!projectId) return false;
  try {
    return localStorage.getItem(`${COPIED_PREFIX}${projectId}`) === "true";
  } catch {
    return false;
  }
}

export function buildOnboardingState(args: {
  clients: Client[];
  projects: Project[];
  currentProject: Project | undefined | null;
  kpis: DashboardKpis | undefined | null;
  projectId: string | null;
}): OnboardingState {
  return {
    hasClient: hasClient(args.clients),
    hasProject: hasProject(args.projects),
    hasTrackingKey: hasTrackingKey(args.currentProject),
    scriptCopied: wasScriptCopied(args.projectId),
    hasEvents: hasEvents(args.kpis),
    hasLeads: hasLeads(args.kpis),
    hasPurchases: hasPurchases(args.kpis),
  };
}

export function buildOnboardingSteps(state: OnboardingState): OnboardingStep[] {
  return [
    {
      id: "hasClient",
      label: "Crie seu primeiro cliente",
      description: "Cadastre o cliente que será dono dos projetos.",
      to: "/clients",
      actionLabel: "Criar cliente",
      done: state.hasClient,
    },
    {
      id: "hasProject",
      label: "Crie um projeto",
      description: "Cada site ou loja vira um projeto rastreável.",
      to: "/projects",
      actionLabel: "Criar projeto",
      done: state.hasProject,
    },
    {
      id: "hasTrackingKey",
      label: "Tracking key disponível",
      description: "A chave é gerada automaticamente ao criar o projeto.",
      to: "/install",
      actionLabel: "Ver instalação",
      done: state.hasTrackingKey,
    },
    {
      id: "scriptCopied",
      label: "Copie o script de instalação",
      description: "Cole o script no <head> do seu site.",
      to: "/install",
      actionLabel: "Instalar tracking",
      done: state.scriptCopied,
    },
    {
      id: "hasEvents",
      label: "Primeiro evento recebido",
      description: "Abra o site para gerar um PageView de teste.",
      to: "/events",
      actionLabel: "Ver eventos",
      done: state.hasEvents,
    },
    {
      id: "hasLeads",
      label: "Primeiro lead capturado",
      description: "Configure formulários ou WhatsApp para gerar leads.",
      to: "/leads",
      actionLabel: "Ver leads",
      done: state.hasLeads,
    },
    {
      id: "hasPurchases",
      label: "Primeira compra registrada",
      description: "Eventos de Purchase aparecem aqui em tempo real.",
      to: "/ecommerce",
      actionLabel: "Ver compras",
      done: state.hasPurchases,
    },
  ];
}

export function getProjectSetupProgress(state: OnboardingState): number {
  const steps = buildOnboardingSteps(state);
  const done = steps.filter((s) => s.done).length;
  return Math.round((done / steps.length) * 100);
}

export function getNextSetupStep(state: OnboardingState): OnboardingStep | null {
  const steps = buildOnboardingSteps(state);
  return steps.find((s) => !s.done) ?? null;
}
