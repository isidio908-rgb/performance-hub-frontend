import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { useEvents } from "@/hooks/useEvents";
import { EventsFilters } from "@/components/events/EventsFilters";
import { EventsTable } from "@/components/events/EventsTable";
import {
  applyDateRange,
  DateRangeFilter,
  type DateRange,
} from "@/components/filters/DateRangeFilter";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingTable } from "@/components/states/LoadingCards";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/events")({
  component: EventsPage,
});

function EventsPage() {
  const { projectId, clientId } = useSelection();
  const { query, events } = useEvents(projectId);

  const [typeFilter, setTypeFilter] = useState<string>("__all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const filtered = useMemo(() => {
    const list = applyDateRange(events, dateRange);
    return list.filter((e) => {
      if (typeFilter !== "__all" && String(e.type) !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [e.name, e.currentUrl, e.visitorId, e.sessionId]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, typeFilter, search, dateRange]);

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
              type={typeFilter}
              search={search}
              onTypeChange={setTypeFilter}
              onSearchChange={setSearch}
            />
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
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
            <>
              <p className="text-xs text-muted-foreground">
                Exibindo {filtered.length} de {events.length} eventos.
              </p>
              <EventsTable events={filtered} />
            </>
          )}
        </>
      )}
    </div>
  );
}
