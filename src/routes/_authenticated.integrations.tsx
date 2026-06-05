import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { FilterBar } from "@/components/filters/FilterBar";
import { TableDensityToggle } from "@/components/table/TableDensityToggle";
import { useTableDensity } from "@/hooks/useTableDensity";
import { DataTableShell } from "@/components/table/DataTableShell";
import { TablePagination } from "@/components/table/TablePagination";
import { paginateClientSide } from "@/utils/pagination";
import { useIntegrationConfigs } from "@/hooks/useIntegrationConfigs";
import { IntegrationConfigsTable } from "@/components/integrations/IntegrationConfigsTable";
import { IntegrationConfigForm } from "@/components/integrations/IntegrationConfigForm";
import { DeleteIntegrationConfigDialog } from "@/components/integrations/DeleteIntegrationConfigDialog";
import type {
  IntegrationConfig,
  CreateIntegrationConfigInput,
  UpdateIntegrationConfigInput,
} from "@/api/integrationConfigs";
import { PageHeader } from "@/components/layout/PageHeader";

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
  const { density } = useTableDensity();
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

  const activeFiltersCount = (ui.filters.provider ? 1 : 0) + (ui.filters.status ? 1 : 0);

  const clearFilters = () =>
    setUi((p) => ({ ...p, filters: { provider: "", status: "" }, page: 1 }));

  // CRUD de configs
  const configsHook = useIntegrationConfigs(projectId);
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<IntegrationConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<IntegrationConfig | null>(null);

  const openCreateConfig = () => {
    setEditingConfig(null);
    setConfigFormOpen(true);
  };
  const openEditConfig = (cfg: IntegrationConfig) => {
    setEditingConfig(cfg);
    setConfigFormOpen(true);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Integrações"
        description="Saúde das integrações, entregas, reprocessamento e configurações."
        actions={
          clientId && projectId ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => processMut.mutate(projectId)}
              disabled={processMut.isPending}
              aria-label="Reprocessar entregas pendentes"
            >
              <Play className="mr-1 h-3 w-3" />
              Reprocessar pendentes
            </Button>
          ) : undefined
        }
      />

      {!clientId || !projectId ? (
        <EmptyState
          title="Selecione um projeto"
          description="Use o seletor no topo para escolher cliente e projeto."
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-medium">Saúde das integrações</h2>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-medium">Configurações de Integração</h2>
                <p className="text-xs text-muted-foreground">
                  Endpoints {`/integrations/configs`}. Os campos exigidos dependem do provider e do
                  backend.
                </p>
              </div>
              <Button size="sm" onClick={openCreateConfig}>
                <Plus className="mr-1 h-3 w-3" />
                Nova configuração
              </Button>
            </div>
            {configsHook.listQuery.isError ? (
              <ErrorState
                title="Erro ao carregar configurações"
                error={configsHook.listQuery.error}
                onRetry={() => configsHook.listQuery.refetch()}
              />
            ) : configsHook.listQuery.isLoading ? (
              <LoadingTable />
            ) : configsHook.configs.length === 0 ? (
              <EmptyState
                icon={Settings2}
                title="Nenhuma configuração ainda"
                description="Crie uma configuração para começar a enviar eventos para o provider."
                action={
                  <Button size="sm" onClick={openCreateConfig}>
                    <Plus className="mr-1 h-3 w-3" /> Nova configuração
                  </Button>
                }
              />
            ) : (
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <IntegrationConfigsTable
                  configs={configsHook.configs}
                  onEdit={openEditConfig}
                  onDelete={setDeletingConfig}
                />
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-medium">Entregas</h2>
            <DataTableShell
              toolbar={
                <FilterBar
                  rightSlot={<TableDensityToggle />}
                  activeFiltersCount={activeFiltersCount}
                  onClearFilters={clearFilters}
                >
                  <IntegrationFilters
                    value={ui.filters}
                    onChange={(filters) => setUi((p) => ({ ...p, filters, page: 1 }))}
                  />
                </FilterBar>
              }
              isLoading={deliveriesQ.isLoading}
              errorState={
                deliveriesQ.isError ? (
                  <ErrorState
                    title="Erro ao carregar entregas"
                    error={deliveriesQ.error}
                    onRetry={() => deliveriesQ.refetch()}
                  />
                ) : undefined
              }
              isEmpty={!deliveriesQ.isLoading && !deliveriesQ.isError && deliveries.length === 0}
              emptyState={
                <EmptyState
                  title="Sem entregas"
                  description="Nenhuma entrega encontrada com os filtros atuais."
                />
              }
              summary={
                <>
                  Exibindo {paged.items.length} de {paged.meta?.total ?? deliveries.length} entregas
                  {isServerPaginated ? " (paginação do servidor)" : ""}.
                </>
              }
              pagination={
                <TablePagination
                  page={ui.page}
                  pageSize={ui.pageSize}
                  total={paged.meta?.total ?? deliveries.length}
                  totalPages={paged.meta?.totalPages}
                  onPageChange={(page) => setUi((p) => ({ ...p, page }))}
                  onPageSizeChange={(pageSize) => setUi((p) => ({ ...p, pageSize, page: 1 }))}
                />
              }
            >
              <IntegrationDeliveriesTable
                deliveries={paged.items}
                onRetry={(id) => retryMut.mutate(id)}
                retryingId={retryMut.isPending ? (retryMut.variables ?? null) : null}
                density={density}
              />
            </DataTableShell>
          </section>
        </>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Próximos passos</CardTitle>
          <CardDescription>
            Para validar uma integração recém-configurada, envie um evento de teste pela tela de{" "}
            <Link to="/install" className="text-primary underline">
              Instalação
            </Link>{" "}
            e acompanhe a entrega aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Configurações desabilitadas continuam visíveis para histórico — use o botão de excluir
          para removê-las definitivamente.
        </CardContent>
      </Card>

      <Dialog open={configFormOpen} onOpenChange={setConfigFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingConfig ? "Editar configuração" : "Nova configuração"}</DialogTitle>
            <DialogDescription>
              {editingConfig
                ? "Atualize os dados da integração."
                : "Adicione uma nova integração para o projeto selecionado."}
            </DialogDescription>
          </DialogHeader>
          {projectId &&
            (editingConfig ? (
              <IntegrationConfigForm
                mode="edit"
                projectId={projectId}
                initial={editingConfig}
                submitting={configsHook.updateConfig.isPending}
                onCancel={() => setConfigFormOpen(false)}
                onSubmit={async (input: UpdateIntegrationConfigInput) => {
                  try {
                    await configsHook.updateConfig.mutateAsync({
                      id: editingConfig.id,
                      input,
                    });
                    toast.success("Configuração atualizada");
                    setConfigFormOpen(false);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Falha ao salvar");
                  }
                }}
              />
            ) : (
              <IntegrationConfigForm
                mode="create"
                projectId={projectId}
                submitting={configsHook.createConfig.isPending}
                onCancel={() => setConfigFormOpen(false)}
                onSubmit={async (input: CreateIntegrationConfigInput) => {
                  try {
                    await configsHook.createConfig.mutateAsync(input);
                    toast.success("Configuração criada");
                    setConfigFormOpen(false);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Falha ao salvar");
                  }
                }}
              />
            ))}
        </DialogContent>
      </Dialog>

      <DeleteIntegrationConfigDialog
        config={deletingConfig}
        open={!!deletingConfig}
        loading={configsHook.deleteConfig.isPending}
        onOpenChange={(o) => !o && setDeletingConfig(null)}
        onConfirm={async () => {
          if (!deletingConfig) return;
          try {
            await configsHook.deleteConfig.mutateAsync(deletingConfig.id);
            toast.success("Configuração excluída");
            setDeletingConfig(null);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Falha ao excluir");
          }
        }}
      />
    </div>
  );
}
