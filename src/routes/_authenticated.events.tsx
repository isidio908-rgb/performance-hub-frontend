import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { useEvents } from "@/hooks/useEvents";
import { usePersistedState } from "@/hooks/usePersistedState";
import { EventsFilters } from "@/components/events/EventsFilters";
import { EventsTable } from "@/components/events/EventsTable";
import { TablePagination } from "@/components/table/TablePagination";
import {
  applyDateRange,
  DateRangeFilter,
  type DateRange,
} from "@/components/filters/DateRangeFilter";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingTable } from "@/components/states/LoadingCards";
import { Activity } from "lucide-react";
import { paginateClientSide } from "@/utils/pagination";

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
    if (isServerPaginated) {
      return { items: filtered, meta };
    }
    return paginateClientSide(filtered, ui.page, ui.pageSize);
  }, [filtered, ui.page, ui.pageSize, isServerPaginated, meta]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
        <p className="text-sm text-muted-foreground">Últimas atividades capturadas pelo tracker.</p>
      </div>

      {!clientId || !projectId ? (
        <EmptyState
          title="Selecione um projeto"
          description="Use o seletor no topo para escolher cliente e projeto."
        />
      ) : (
        <>
          <div className="space-y-3">
            <EventsFilters
              type={ui.typeFilter}
              search={ui.search}
              onTypeChange={(v) => setUi((p) => ({ ...p, typeFilter: v, page: 1 }))}
              onSearchChange={(v) => setUi((p) => ({ ...p, search: v, page: 1 }))}
            />
            <DateRangeFilter
              value={ui.dateRange}
              onChange={(v) => setUi((p) => ({ ...p, dateRange: v, page: 1 }))}
            />
          </div>

          {query.isLoading ? (
            <LoadingTable />
          ) : query.isError ? (
            <ErrorState
              title="Erro ao carregar eventos"
              error={query.error}
              onRetry={() => query.refetch()}
            />
          ) : filtered.length === 0 ? (
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
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                Exibindo {paged.items.length} de {paged.meta?.total ?? filtered.length} eventos
                {isServerPaginated ? " (paginação do servidor)" : ""}.
              </div>
              <EventsTable events={paged.items} />
              <TablePagination
                page={ui.page}
                pageSize={ui.pageSize}
                total={paged.meta?.total ?? filtered.length}
                totalPages={paged.meta?.totalPages}
                onPageChange={(page) => setUi((p) => ({ ...p, page }))}
                onPageSizeChange={(pageSize) => setUi((p) => ({ ...p, pageSize, page: 1 }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
