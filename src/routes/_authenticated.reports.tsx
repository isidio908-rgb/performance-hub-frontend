import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Map as MapIcon, GitBranch, Layers } from "lucide-react";
import { useSelection } from "@/providers/SelectionProvider";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTableShell } from "@/components/table/DataTableShell";
import { TableDensityToggle } from "@/components/table/TableDensityToggle";
import { useTableDensity } from "@/hooks/useTableDensity";
import {
  useAttribution,
  useAttributionModels,
  useConversionPaths,
  useTopConversionPaths,
  useAssistedChannels,
} from "@/hooks/useAdvancedAnalytics";
import { AttributionOverview } from "@/components/reports/AttributionOverview";
import { ConversionPathsTable, normalizePathRows } from "@/components/reports/ConversionPathsTable";
import {
  AssistedChannelsTable,
  normalizeAssistedRows,
} from "@/components/reports/AssistedChannelsTable";
import {
  AttributionModelSelect,
  FALLBACK_MODELS,
} from "@/components/reports/AttributionModelSelect";
import type { AttributionModel } from "@/types";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { projectId, clientId } = useSelection();
  const { density } = useTableDensity();

  const modelsQ = useAttributionModels(projectId);
  const models: AttributionModel[] = (
    modelsQ.data && modelsQ.data.length > 0 ? modelsQ.data : FALLBACK_MODELS
  ) as AttributionModel[];
  const isFallback = !modelsQ.data || modelsQ.data.length === 0;

  const [model, setModel] = useState<AttributionModel | undefined>(undefined);
  useEffect(() => {
    if (!model && models.length > 0) setModel(models[0]);
  }, [model, models]);

  const attributionQ = useAttribution(projectId);
  const pathsQ = useConversionPaths(projectId);
  const topPathsQ = useTopConversionPaths(projectId);
  const assistedQ = useAssistedChannels(projectId, model);

  const assistedRows = normalizeAssistedRows(assistedQ.data ?? []);
  const topPathRows = normalizePathRows(topPathsQ.data ?? []);
  const allPathRows = normalizePathRows(pathsQ.data ?? []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Relatórios"
        description="Atribuição, caminhos de conversão e canais assistidos."
        actions={<TableDensityToggle />}
      />

      {!clientId || !projectId ? (
        <EmptyState
          title="Selecione um projeto"
          description="Use o seletor no topo para escolher cliente e projeto."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <AttributionModelSelect
              value={model}
              onChange={setModel}
              models={models}
              isFallback={isFallback}
            />
          </div>

          {attributionQ.isError ? (
            <ErrorState
              title="Erro ao carregar atribuição"
              error={attributionQ.error}
              onRetry={() => attributionQ.refetch()}
            />
          ) : (
            <AttributionOverview
              data={attributionQ.data ?? null}
              loading={attributionQ.isLoading}
            />
          )}

          <DataTableShell
            title="Canais assistidos"
            description="Conversões assistidas vs diretas por canal."
            isLoading={assistedQ.isLoading}
            errorState={
              assistedQ.isError ? (
                <ErrorState
                  title="Erro ao carregar canais assistidos"
                  error={assistedQ.error}
                  onRetry={() => assistedQ.refetch()}
                />
              ) : undefined
            }
            isEmpty={!assistedQ.isLoading && !assistedQ.isError && assistedRows.length === 0}
            emptyState={
              <EmptyState
                icon={Layers}
                title="Sem canais assistidos"
                description="Ainda não há dados suficientes para calcular assistências por canal."
              />
            }
          >
            <AssistedChannelsTable data={assistedQ.data ?? []} density={density} />
          </DataTableShell>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <DataTableShell
              title="Top caminhos de conversão"
              description="Caminhos com maior volume de conversão."
              isLoading={topPathsQ.isLoading}
              errorState={
                topPathsQ.isError ? (
                  <ErrorState
                    title="Erro ao carregar top caminhos"
                    error={topPathsQ.error}
                    onRetry={() => topPathsQ.refetch()}
                  />
                ) : undefined
              }
              isEmpty={!topPathsQ.isLoading && !topPathsQ.isError && topPathRows.length === 0}
              emptyState={
                <EmptyState
                  icon={MapIcon}
                  title="Sem caminhos de conversão"
                  description="Ainda não há jornadas registradas para este projeto."
                />
              }
            >
              <ConversionPathsTable data={topPathsQ.data ?? []} density={density} />
            </DataTableShell>

            <DataTableShell
              title="Todos os caminhos"
              description="Sequências de toques que levaram à conversão."
              isLoading={pathsQ.isLoading}
              errorState={
                pathsQ.isError ? (
                  <ErrorState
                    title="Erro ao carregar caminhos"
                    error={pathsQ.error}
                    onRetry={() => pathsQ.refetch()}
                  />
                ) : undefined
              }
              isEmpty={!pathsQ.isLoading && !pathsQ.isError && allPathRows.length === 0}
              emptyState={
                <EmptyState
                  icon={GitBranch}
                  title="Sem caminhos detalhados"
                  description="Aguardando mais eventos para reconstruir as jornadas."
                />
              }
            >
              <ConversionPathsTable data={pathsQ.data ?? []} density={density} />
            </DataTableShell>
          </div>
        </>
      )}
    </div>
  );
}
