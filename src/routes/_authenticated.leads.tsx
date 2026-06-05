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
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingTable } from "@/components/states/LoadingCards";
import { applyDateRange, type DateRange } from "@/components/filters/DateRangeFilter";
import { paginateClientSide } from "@/utils/pagination";

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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Conversões capturadas via formulário, WhatsApp e integrações.
        </p>
      </div>

      {!clientId || !projectId ? (
        <EmptyState
          title="Selecione um projeto"
          description="Use o seletor no topo para escolher cliente e projeto."
        />
      ) : (
        <>
          <LeadsFilters
            status={ui.status}
            search={ui.search}
            dateRange={ui.dateRange}
            onStatusChange={(v) => setUi((p) => ({ ...p, status: v, page: 1 }))}
            onSearchChange={(v) => setUi((p) => ({ ...p, search: v, page: 1 }))}
            onDateRangeChange={(v) => setUi((p) => ({ ...p, dateRange: v, page: 1 }))}
          />

          {query.isLoading ? (
            <LoadingTable />
          ) : query.isError ? (
            <ErrorState
              title="Erro ao carregar leads"
              error={query.error}
              onRetry={() => query.refetch()}
            />
          ) : filtered.length === 0 ? (
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
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                Exibindo {paged.items.length} de {paged.meta?.total ?? filtered.length} leads
                {isServerPaginated ? " (paginação do servidor)" : ""}.
              </div>
              <LeadsTable leads={paged.items} />
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
