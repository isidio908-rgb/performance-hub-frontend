import { createFileRoute, Link } from "@tanstack/react-router";
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
  Code2,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { useSelection } from "@/providers/SelectionProvider";
import { dashboardApi } from "@/api/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/api/client";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { Button } from "@/components/ui/button";

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

  const kpisQuery = useQuery({
    queryKey: ["analytics", "overview", projectId],
    queryFn: () => dashboardApi.overview(projectId!),
    enabled: !!projectId,
    retry: 1,
  });

  const k = kpisQuery.data;

  const hasEvents = (k?.events ?? 0) > 0;
  const hasLeads = (k?.leads ?? 0) > 0;
  const hasPurchases = (k?.purchases ?? 0) > 0;
  const showInstallCta = !hasEvents && !hasLeads && !hasPurchases;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral de performance do projeto selecionado.
        </p>
      </div>

      {!clientId || !projectId ? (
        <EmptySelection />
      ) : kpisQuery.isLoading ? (
        <KpiSkeleton />
      ) : kpisQuery.isError ? (
        <ErrorState error={kpisQuery.error} />
      ) : (
        <div className="space-y-4">
          {showInstallCta && (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Nenhuma atividade ainda</CardTitle>
                  <CardDescription>
                    Instale o script de tracking para começar a receber eventos, leads e compras.
                  </CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link to="/install">Instalar tracking</Link>
                </Button>
              </CardHeader>
            </Card>
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
