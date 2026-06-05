import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { usePurchases } from "@/hooks/usePurchases";
import { usePersistedState } from "@/hooks/usePersistedState";
import { PurchasesFilters } from "@/components/purchases/PurchasesFilters";
import { PurchasesTable } from "@/components/purchases/PurchasesTable";
import { PurchaseSummaryCards } from "@/components/purchases/PurchaseSummaryCards";
import { TablePagination } from "@/components/table/TablePagination";
import { DataTableShell } from "@/components/table/DataTableShell";
import { FilterBar } from "@/components/filters/FilterBar";
import { TableDensityToggle } from "@/components/table/TableDensityToggle";
import { useTableDensity } from "@/hooks/useTableDensity";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingCards } from "@/components/states/LoadingCards";
import { applyDateRange, type DateRange } from "@/components/filters/DateRangeFilter";
import { purchaseTotal } from "@/api/purchases";
import { paginateClientSide } from "@/utils/pagination";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/_authenticated/ecommerce")({
  component: EcommercePage,
});

interface PurchasesUiState {
  search: string;
  dateRange: DateRange;
  minValue: string;
  maxValue: string;
  page: number;
  pageSize: number;
}

const DEFAULT_STATE: PurchasesUiState = {
  search: "",
  dateRange: { from: null, to: null },
  minValue: "",
  maxValue: "",
  page: 1,
  pageSize: 20,
};

function parseNum(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function EcommercePage() {
  const { projectId, clientId } = useSelection();
  const { density } = useTableDensity();
  const [ui, setUi] = usePersistedState<PurchasesUiState>("vps_filters_purchases", DEFAULT_STATE);

  const { query, purchases, meta, isServerPaginated } = usePurchases(projectId, {
    page: ui.page,
    pageSize: ui.pageSize,
  });

  const min = parseNum(ui.minValue);
  const max = parseNum(ui.maxValue);

  const filtered = useMemo(() => {
    let list = purchases;
    list = applyDateRange(list, ui.dateRange);
    return list.filter((p) => {
      const total = purchaseTotal(p);
      if (min !== null && total < min) return false;
      if (max !== null && total > max) return false;
      if (!ui.search.trim()) return true;
      const q = ui.search.trim().toLowerCase();
      const hay = [
        p.orderId,
        p.customerEmail,
        p.customerName,
        p.utmSource,
        p.utmMedium,
        p.utmCampaign,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [purchases, ui.search, ui.dateRange, min, max]);

  const paged = useMemo(() => {
    if (isServerPaginated) return { items: filtered, meta };
    return paginateClientSide(filtered, ui.page, ui.pageSize);
  }, [filtered, ui.page, ui.pageSize, isServerPaginated, meta]);

  const activeFiltersCount =
    (ui.search.trim() ? 1 : 0) +
    (ui.dateRange.from || ui.dateRange.to ? 1 : 0) +
    (ui.minValue ? 1 : 0) +
    (ui.maxValue ? 1 : 0);

  const clearFilters = () =>
    setUi((p) => ({
      ...p,
      search: "",
      dateRange: { from: null, to: null },
      minValue: "",
      maxValue: "",
      page: 1,
    }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Compras"
        description="Compras, receita e ticket médio do projeto (e-commerce)."
      />

      {!clientId || !projectId ? (
        <EmptyState
          title="Selecione um projeto"
          description="Use o seletor no topo para escolher cliente e projeto."
        />
      ) : (
        <>
          {query.isLoading ? (
            <LoadingCards count={4} />
          ) : query.isError ? (
            <ErrorState
              title="Erro ao carregar compras"
              error={query.error}
              onRetry={() => query.refetch()}
            />
          ) : (
            <PurchaseSummaryCards purchases={filtered} />
          )}

          {!query.isError && (
            <DataTableShell
              toolbar={
                <FilterBar
                  rightSlot={<TableDensityToggle />}
                  search={ui.search}
                  onSearchChange={(v) => setUi((p) => ({ ...p, search: v, page: 1 }))}
                  searchPlaceholder="Buscar compra por pedido ou visitante…"
                  searchAriaLabel="Buscar compras"
                  activeFiltersCount={activeFiltersCount}
                  onClearFilters={clearFilters}
                >
                  <PurchasesFilters
                    dateRange={ui.dateRange}
                    minValue={ui.minValue}
                    maxValue={ui.maxValue}
                    onDateRangeChange={(v) => setUi((p) => ({ ...p, dateRange: v, page: 1 }))}
                    onMinValueChange={(v) => setUi((p) => ({ ...p, minValue: v, page: 1 }))}
                    onMaxValueChange={(v) => setUi((p) => ({ ...p, maxValue: v, page: 1 }))}
                  />
                </FilterBar>
              }
              isLoading={query.isLoading}
              isEmpty={!query.isLoading && !query.isError && filtered.length === 0}
              emptyState={
                <EmptyState
                  icon={ShoppingCart}
                  title="Nenhuma compra"
                  description={
                    purchases.length === 0
                      ? "Este projeto ainda não registrou compras. Instale o tracking para capturar eventos Purchase."
                      : "Nenhuma compra corresponde aos filtros atuais."
                  }
                  action={
                    purchases.length === 0 ? (
                      <Button asChild size="sm">
                        <Link to="/install">Instalar tracking</Link>
                      </Button>
                    ) : undefined
                  }
                />
              }
              summary={
                <>
                  Exibindo {paged.items.length} de {paged.meta?.total ?? filtered.length} compras
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
              <PurchasesTable purchases={paged.items} density={density} />
            </DataTableShell>
          )}
        </>
      )}
    </div>
  );
}
