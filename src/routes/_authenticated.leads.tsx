import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { useLeads } from "@/hooks/useLeads";
import { usePersistedState } from "@/hooks/usePersistedState";
import { LeadsFilters } from "@/components/leads/LeadsFilters";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { TablePagination } from "@/components/table/TablePagination";
import { DataTableShell } from "@/components/table/DataTableShell";
import { FilterBar } from "@/components/filters/FilterBar";
import { TableDensityToggle } from "@/components/table/TableDensityToggle";
import { useTableDensity } from "@/hooks/useTableDensity";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { applyDateRange, type DateRange } from "@/components/filters/DateRangeFilter";
import { paginateClientSide } from "@/utils/pagination";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsPage,
});

interface LeadsUiState {
  status: string;
  search: string;
  dateRange: DateRange;
  page: number;
  pageSize: number;
}

const DEFAULT_STATE: LeadsUiState = {
  status: "__all",
  search: "",
  dateRange: { from: null, to: null },
  page: 1,
  pageSize: 20,
};

function LeadsPage() {
  const { projectId, clientId } = useSelection();
  const { density } = useTableDensity();
  const [ui, setUi] = usePersistedState<LeadsUiState>("vps_filters_leads", DEFAULT_STATE);

  const { query, leads, meta, isServerPaginated } = useLeads(projectId, {
    page: ui.page,
    pageSize: ui.pageSize,
  });

  const filtered = useMemo(() => {
    let list = leads;
    list = applyDateRange(list, ui.dateRange);
    return list.filter((l) => {
      if (ui.status !== "__all") {
        if (!l.status || String(l.status).toUpperCase() !== ui.status) return false;
      }
      if (ui.search.trim()) {
        const q = ui.search.trim().toLowerCase();
        const hay = [l.name, l.email, l.phone, l.source].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, ui.status, ui.search, ui.dateRange]);

  const paged = useMemo(() => {
    if (isServerPaginated) return { items: filtered, meta };
    return paginateClientSide(filtered, ui.page, ui.pageSize);
  }, [filtered, ui.page, ui.pageSize, isServerPaginated, meta]);

  const activeFiltersCount =
    (ui.status !== "__all" ? 1 : 0) +
    (ui.search.trim() ? 1 : 0) +
    (ui.dateRange.from || ui.dateRange.to ? 1 : 0);

  const clearFilters = () =>
    setUi((p) => ({
      ...p,
      status: "__all",
      search: "",
      dateRange: { from: null, to: null },
      page: 1,
    }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Leads"
        description="Conversões capturadas via formulário, WhatsApp e integrações."
      />

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
              searchPlaceholder="Buscar lead por nome, email ou telefone…"
              searchAriaLabel="Buscar leads"
              activeFiltersCount={activeFiltersCount}
              onClearFilters={clearFilters}
            >
              <LeadsFilters
                status={ui.status}
                dateRange={ui.dateRange}
                onStatusChange={(v) => setUi((p) => ({ ...p, status: v, page: 1 }))}
                onDateRangeChange={(v) => setUi((p) => ({ ...p, dateRange: v, page: 1 }))}
              />
            </FilterBar>
          }
          isLoading={query.isLoading}
          errorState={
            query.isError ? (
              <ErrorState
                title="Erro ao carregar leads"
                error={query.error}
                onRetry={() => query.refetch()}
              />
            ) : undefined
          }
          isEmpty={!query.isLoading && !query.isError && filtered.length === 0}
          emptyState={
            <EmptyState
              icon={UserPlus}
              title="Nenhum lead"
              description={
                leads.length === 0
                  ? "Este projeto ainda não recebeu leads. Instale o tracking ou crie eventos do tipo Lead."
                  : "Nenhum lead corresponde aos filtros atuais."
              }
              action={
                leads.length === 0 ? (
                  <Button asChild size="sm">
                    <Link to="/install">Instalar tracking</Link>
                  </Button>
                ) : undefined
              }
            />
          }
          summary={
            <>
              Exibindo {paged.items.length} de {paged.meta?.total ?? filtered.length} leads
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
          <LeadsTable leads={paged.items} density={density} />
        </DataTableShell>
      )}
    </div>
  );
}
