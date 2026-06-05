import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSelection } from "@/providers/SelectionProvider";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import {
  useAttribution,
  useAttributionModels,
  useConversionPaths,
  useTopConversionPaths,
  useAssistedChannels,
} from "@/hooks/useAdvancedAnalytics";
import { AttributionOverview } from "@/components/reports/AttributionOverview";
import { ConversionPathsTable } from "@/components/reports/ConversionPathsTable";
import { AssistedChannelsTable } from "@/components/reports/AssistedChannelsTable";
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Atribuição, caminhos de conversão e canais assistidos.
        </p>
      </div>

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

          {assistedQ.isError ? (
            <ErrorState
              title="Erro ao carregar canais assistidos"
              error={assistedQ.error}
              onRetry={() => assistedQ.refetch()}
            />
          ) : (
            <AssistedChannelsTable data={assistedQ.data ?? []} loading={assistedQ.isLoading} />
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {topPathsQ.isError ? (
              <ErrorState
                title="Erro ao carregar top paths"
                error={topPathsQ.error}
                onRetry={() => topPathsQ.refetch()}
              />
            ) : (
              <ConversionPathsTable
                title="Top caminhos de conversão"
                description="Caminhos com maior volume de conversão."
                data={topPathsQ.data ?? []}
                loading={topPathsQ.isLoading}
              />
            )}
            {pathsQ.isError ? (
              <ErrorState
                title="Erro ao carregar caminhos"
                error={pathsQ.error}
                onRetry={() => pathsQ.refetch()}
              />
            ) : (
              <ConversionPathsTable data={pathsQ.data ?? []} loading={pathsQ.isLoading} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
