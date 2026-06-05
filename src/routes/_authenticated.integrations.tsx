import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Play, Info } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingTable } from "@/components/states/LoadingCards";
import {
  useIntegrationHealth,
  useIntegrationDeliveries,
  useRetryDelivery,
  useProcessPending,
} from "@/hooks/useIntegrations";
import { IntegrationHealthCards } from "@/components/integrations/IntegrationHealthCards";
import { IntegrationDeliveriesTable } from "@/components/integrations/IntegrationDeliveriesTable";
import {
  IntegrationFilters,
  type IntegrationFilterValues,
} from "@/components/integrations/IntegrationFilters";
import { TablePagination } from "@/components/table/TablePagination";
import { paginateClientSide } from "@/utils/pagination";

export const Route = createFileRoute("/_authenticated/integrations")({
  component: IntegrationsPage,
});

interface IntegrationsUiState {
  filters: IntegrationFilterValues;
  page: number;
  pageSize: number;
}

const DEFAULT_STATE: IntegrationsUiState = {
  filters: { provider: "", status: "" },
  page: 1,
  pageSize: 20,
};

function IntegrationsPage() {
  const { projectId, clientId } = useSelection();
  const [ui, setUi] = usePersistedState<IntegrationsUiState>(
    "vps_filters_integrations",
    DEFAULT_STATE,
  );

  const healthQ = useIntegrationHealth(projectId);
  const deliveriesQ = useIntegrationDeliveries({
    projectId: projectId ?? undefined,
    provider: ui.filters.provider || undefined,
    status: ui.filters.status || undefined,
    page: ui.page,
    pageSize: ui.pageSize,
  });

  const retryMut = useRetryDelivery();
  const processMut = useProcessPending();

  const deliveries = deliveriesQ.deliveries;
  const isServerPaginated = deliveriesQ.isServerPaginated;
  const serverMeta = deliveriesQ.meta;

  const paged = useMemo(() => {
    if (isServerPaginated) return { items: deliveries, meta: serverMeta };
    return paginateClientSide(deliveries, ui.page, ui.pageSize);
  }, [deliveries, ui.page, ui.pageSize, isServerPaginated, serverMeta]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Integrações</h1>
        <p className="text-sm text-muted-foreground">
          Saúde das integrações, entregas e reprocessamento.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm">Configuração de integrações</CardTitle>
            <CardDescription>
              A configuração de integrações (Meta CAPI, GA4, Google Ads, Webhook) será habilitada
              quando o backend expor os endpoints de configuração.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {!clientId || !projectId ? (
        <EmptyState
          title="Selecione um projeto"
          description="Use o seletor no topo para escolher cliente e projeto."
        />
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Saúde das integrações</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => processMut.mutate(projectId)}
                disabled={processMut.isPending}
              >
                <Play className="mr-1 h-3 w-3" />
                Reprocessar pendentes
              </Button>
            </div>
            {healthQ.isError ? (
              <ErrorState
                title="Erro ao carregar saúde"
                error={healthQ.error}
                onRetry={() => healthQ.refetch()}
              />
            ) : (
              <IntegrationHealthCards data={healthQ.data ?? []} loading={healthQ.isLoading} />
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-medium">Entregas</h2>
            <IntegrationFilters
              value={ui.filters}
              onChange={(filters) => setUi((p) => ({ ...p, filters, page: 1 }))}
            />
            {deliveriesQ.isLoading ? (
              <LoadingTable />
            ) : deliveriesQ.isError ? (
              <ErrorState
                title="Erro ao carregar entregas"
                error={deliveriesQ.error}
                onRetry={() => deliveriesQ.refetch()}
              />
            ) : deliveries.length === 0 ? (
              <EmptyState
                title="Sem entregas"
                description="Nenhuma entrega encontrada com os filtros atuais."
              />
            ) : (
              <div className="overflow-hidden rounded-md border">
                <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                  Exibindo {paged.items.length} de {paged.meta?.total ?? deliveries.length} entregas
                  {isServerPaginated ? " (paginação do servidor)" : ""}.
                </div>
                <IntegrationDeliveriesTable
                  deliveries={paged.items}
                  onRetry={(id) => retryMut.mutate(id)}
                  retryingId={retryMut.isPending ? (retryMut.variables ?? null) : null}
                />
                <TablePagination
                  page={ui.page}
                  pageSize={ui.pageSize}
                  total={paged.meta?.total ?? deliveries.length}
                  totalPages={paged.meta?.totalPages}
                  onPageChange={(page) => setUi((p) => ({ ...p, page }))}
                  onPageSizeChange={(pageSize) => setUi((p) => ({ ...p, pageSize, page: 1 }))}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
