import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { useEvents } from "@/hooks/useEvents";
import { usePersistedState } from "@/hooks/usePersistedState";
import { EventsFilters } from "@/components/events/EventsFilters";
import { EventsTable } from "@/components/events/EventsTable";
import { TablePagination } from "@/components/table/TablePagination";
import { DataTableShell } from "@/components/table/DataTableShell";
import { FilterBar } from "@/components/filters/FilterBar";
import { TableDensityToggle } from "@/components/table/TableDensityToggle";
import { useTableDensity } from "@/hooks/useTableDensity";
import { applyDateRange, type DateRange } from "@/components/filters/DateRangeFilter";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { paginateClientSide } from "@/utils/pagination";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/_authenticated/events")({
  component: EventsPage,
});

interface EventsUiState {
  typeFilter: string;
  search: string;
  dateRange: DateRange;
  page: number;
  pageSize: number;
}

const DEFAULT_STATE: EventsUiState = {
  typeFilter: "__all",
  search: "",
  dateRange: { from: null, to: null },
  page: 1,
  pageSize: 20,
};

function EventsPage() {
  const { projectId, clientId } = useSelection();
  const { density } = useTableDensity();
  const [ui, setUi] = usePersistedState<EventsUiState>("vps_filters_events", DEFAULT_STATE);

  const { query, events, meta, isServerPaginated } = useEvents(projectId, {
    page: ui.page,
    pageSize: ui.pageSize,
  });

  const filtered = useMemo(() => {
    const list = applyDateRange(events, ui.dateRange);
    return list.filter((e) => {
      if (ui.typeFilter !== "__all" && String(e.type) !== ui.typeFilter) return false;
      if (ui.search.trim()) {
        const q = ui.search.trim().toLowerCase();
        const hay = [e.name, e.currentUrl, e.visitorId, e.sessionId]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, ui.typeFilter, ui.search, ui.dateRange]);

  const paged = useMemo(() => {
    if (isServerPaginated) return { items: filtered, meta };
    return paginateClientSide(filtered, ui.page, ui.pageSize);
  }, [filtered, ui.page, ui.pageSize, isServerPaginated, meta]);

  const activeFiltersCount =
    (ui.typeFilter !== "__all" ? 1 : 0) +
    (ui.search.trim() ? 1 : 0) +
    (ui.dateRange.from || ui.dateRange.to ? 1 : 0);

  const clearFilters = () =>
    setUi((p) => ({
      ...p,
      typeFilter: "__all",
      search: "",
      dateRange: { from: null, to: null },
      page: 1,
    }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader title="Eventos" description="Últimas atividades capturadas pelo tracker." />

      {!clientId || !projectId ? (
        <EmptyState
          title="Selecione um projeto"
          description="Use o seletor no topo para escolher cliente e projeto."
        />
      ) : (
        <DataTableShell
          toolbar={
            <FilterBar
              rightSlot={<TableDensityToggle />}
              search={ui.search}
              onSearchChange={(v) => setUi((p) => ({ ...p, search: v, page: 1 }))}
              searchPlaceholder="Buscar por URL, visitante ou sessão…"
              searchAriaLabel="Buscar eventos"
              activeFiltersCount={activeFiltersCount}
              onClearFilters={clearFilters}
            >
              <EventsFilters
                type={ui.typeFilter}
                dateRange={ui.dateRange}
                onTypeChange={(v) => setUi((p) => ({ ...p, typeFilter: v, page: 1 }))}
                onDateRangeChange={(v) => setUi((p) => ({ ...p, dateRange: v, page: 1 }))}
              />
            </FilterBar>
          }
          isLoading={query.isLoading}
          errorState={
            query.isError ? (
              <ErrorState
                title="Erro ao carregar eventos"
                error={query.error}
                onRetry={() => query.refetch()}
              />
            ) : undefined
          }
          isEmpty={!query.isLoading && !query.isError && filtered.length === 0}
          emptyState={
            <EmptyState
              icon={Activity}
              title="Nenhum evento"
              description={
                events.length === 0
                  ? "Este projeto ainda não recebeu eventos. Instale o script para começar."
                  : "Nenhum evento corresponde aos filtros atuais."
              }
              action={
                events.length === 0 ? (
                  <Button asChild size="sm">
                    <Link to="/install">Instalar tracking</Link>
                  </Button>
                ) : undefined
              }
            />
          }
          summary={
            <>
              Exibindo {paged.items.length} de {paged.meta?.total ?? filtered.length} eventos
              {isServerPaginated ? " (paginação do servidor)" : ""}.
            </>
          }
          pagination={
            <TablePagination
              page={ui.page}
              pageSize={ui.pageSize}
              total={paged.meta?.total ?? filtered.length}
              totalPages={paged.meta?.totalPages}
              onPageChange={(page) => setUi((p) => ({ ...p, page }))}
              onPageSizeChange={(pageSize) => setUi((p) => ({ ...p, pageSize, page: 1 }))}
            />
          }
        >
          <EventsTable events={paged.items} density={density} />
        </DataTableShell>
      )}
    </div>
  );
}
