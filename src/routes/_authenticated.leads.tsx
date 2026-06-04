import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { useLeads } from "@/hooks/useLeads";
import { LeadsFilters } from "@/components/leads/LeadsFilters";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingTable } from "@/components/states/LoadingCards";
import { applyDateRange, type DateRange } from "@/components/filters/DateRangeFilter";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const { projectId, clientId } = useSelection();
  const { query, leads } = useLeads(projectId);

  const [status, setStatus] = useState("__all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const filtered = useMemo(() => {
    let list = leads;
    list = applyDateRange(list, dateRange);
    return list.filter((l) => {
      if (status !== "__all") {
        if (!l.status || String(l.status).toUpperCase() !== status) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [l.name, l.email, l.phone, l.source].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, status, search, dateRange]);

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
            status={status}
            search={search}
            dateRange={dateRange}
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onDateRangeChange={setDateRange}
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
            <>
              <p className="text-xs text-muted-foreground">
                Exibindo {filtered.length} de {leads.length} leads.
              </p>
              <LeadsTable leads={filtered} />
            </>
          )}
        </>
      )}
    </div>
  );
}
