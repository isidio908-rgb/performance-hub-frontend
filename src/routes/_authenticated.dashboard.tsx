import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Eye,
  UserPlus,
  MessageCircle,
  FileText,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  DollarSign,
  Receipt,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { useSelection } from "@/providers/SelectionProvider";
import { dashboardApi } from "@/api/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/api/client";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import {
  useRevenueTimeline,
  useFunnelSummary,
  useRevenueByChannel,
  useRevenueByCampaign,
} from "@/hooks/useAdvancedAnalytics";
import { RevenueTimelineChart } from "@/components/analytics/RevenueTimelineChart";
import { FunnelSummaryCard } from "@/components/analytics/FunnelSummaryCard";
import { RevenueByChannelChart } from "@/components/analytics/RevenueByChannelChart";
import { RevenueByCampaignTable } from "@/components/analytics/RevenueByCampaignTable";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { NextBestActionCard } from "@/components/onboarding/NextBestActionCard";
import { buildOnboardingState, getProjectSetupProgress } from "@/utils/onboarding";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const formatNumber = (n: number | undefined) =>
  n === undefined ? "—" : new Intl.NumberFormat("pt-BR").format(n);

const formatCurrency = (n: number | undefined) =>
  n === undefined
    ? "—"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function DashboardPage() {
  const { projectId, clientId } = useSelection();
  const { clients } = useClients();
  const { projects } = useProjects();
  const currentProject = projects.find((p) => p.id === projectId) ?? null;

  const kpisQuery = useQuery({
    queryKey: ["analytics", "overview", projectId],
    queryFn: () => dashboardApi.overview(projectId!),
    enabled: !!projectId,
    retry: 1,
  });

  const timelineQ = useRevenueTimeline(projectId);
  const funnelQ = useFunnelSummary(projectId);
  const channelQ = useRevenueByChannel(projectId);
  const campaignQ = useRevenueByCampaign(projectId);

  const k = kpisQuery.data;
  const hasEvents = (k?.events ?? 0) > 0;
  const hasLeads = (k?.leads ?? 0) > 0;
  const hasPurchases = (k?.purchases ?? 0) > 0;

  const onboardingState = buildOnboardingState({
    clients,
    projects,
    currentProject,
    kpis: k,
    projectId,
  });
  const progress = getProjectSetupProgress(onboardingState);
  const showOnboarding = progress < 100;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral de performance do projeto selecionado.
        </p>
      </div>

      {!clients.length ? (
        <div className="space-y-4">
          <NextBestActionCard
            title="Crie seu primeiro cliente"
            description="Comece cadastrando o cliente que será dono dos projetos rastreados."
            actionLabel="Criar cliente"
            to="/clients"
          />
          <OnboardingChecklist state={onboardingState} />
        </div>
      ) : !projects.length ? (
        <div className="space-y-4">
          <NextBestActionCard
            title="Crie um projeto"
            description="Cada site ou loja vira um projeto com tracking key própria."
            actionLabel="Criar projeto"
            to="/projects"
          />
          <OnboardingChecklist state={onboardingState} />
        </div>
      ) : !clientId || !projectId ? (
        <div className="space-y-4">
          <EmptySelection />
          <OnboardingChecklist state={onboardingState} />
        </div>
      ) : kpisQuery.isLoading ? (
        <KpiSkeleton />
      ) : kpisQuery.isError ? (
        <ErrorState error={kpisQuery.error} />
      ) : (
        <div className="space-y-6">
          {showOnboarding && <OnboardingChecklist state={onboardingState} />}

          {!hasEvents && (
            <NextBestActionCard
              title="Instale o tracking"
              description="Cole o script no seu site para começar a receber eventos."
              actionLabel="Instalar tracking"
              to="/install"
              variant="primary"
            />
          )}
          {hasEvents && !hasLeads && !hasPurchases && (
            <NextBestActionCard
              title="Configure captura de leads e compras"
              description="Eventos chegando! Agora dispare Lead e Purchase no seu site."
              actionLabel="Ver eventos"
              to="/events"
              variant="muted"
            />
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <KpiCard label="PageViews" value={formatNumber(k?.pageViews)} icon={Eye} to="/events" />
            <KpiCard label="Eventos" value={formatNumber(k?.events)} icon={Activity} to="/events" />
            <KpiCard label="Leads" value={formatNumber(k?.leads)} icon={UserPlus} to="/leads" />
            <KpiCard
              label="WhatsApp"
              value={formatNumber(k?.whatsappClick)}
              icon={MessageCircle}
              to="/events"
            />
            <KpiCard
              label="Form Submit"
              value={formatNumber(k?.formSubmit)}
              icon={FileText}
              to="/events"
            />
            <KpiCard
              label="Add to Cart"
              value={formatNumber(k?.addToCart)}
              icon={ShoppingBag}
              to="/ecommerce"
            />
            <KpiCard
              label="Checkouts"
              value={formatNumber(k?.checkouts)}
              icon={CreditCard}
              to="/ecommerce"
            />
            <KpiCard
              label="Compras"
              value={formatNumber(k?.purchases)}
              icon={CheckCircle2}
              to="/ecommerce"
            />
            <KpiCard
              label="Receita"
              value={formatCurrency(k?.revenue)}
              icon={DollarSign}
              to="/ecommerce"
            />
            <KpiCard
              label="Ticket Médio"
              value={formatCurrency(k?.averageTicket)}
              icon={Receipt}
              to="/ecommerce"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueTimelineChart data={timelineQ.data ?? []} loading={timelineQ.isLoading} />
            <FunnelSummaryCard data={funnelQ.data ?? null} loading={funnelQ.isLoading} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueByChannelChart data={channelQ.data ?? []} loading={channelQ.isLoading} />
            <RevenueByCampaignTable data={campaignQ.data ?? []} loading={campaignQ.isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

function EmptySelection() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Selecione um cliente e projeto</CardTitle>
        <CardDescription>
          Use o seletor no topo para escolher o contexto. Os KPIs aparecem aqui assim que um projeto
          for selecionado.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ErrorState({ error }: { error: unknown }) {
  const msg =
    error instanceof ApiError
      ? `${error.status || ""} ${error.message}`.trim()
      : "Erro desconhecido ao carregar KPIs.";
  return (
    <div className="space-y-4">
      <ApiEnvironmentAlert error={error} />
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Erro ao carregar KPIs</CardTitle>
          <CardDescription>{msg}</CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Esta página tentará novamente quando você trocar de projeto.
        </CardContent>
      </Card>
    </div>
  );
}
