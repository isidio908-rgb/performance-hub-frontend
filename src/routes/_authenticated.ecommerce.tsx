import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelection } from "@/providers/SelectionProvider";
import { usePurchases } from "@/hooks/usePurchases";
import { usePersistedState } from "@/hooks/usePersistedState";
import { PurchasesFilters } from "@/components/purchases/PurchasesFilters";
import { PurchasesTable } from "@/components/purchases/PurchasesTable";
import { PurchaseSummaryCards } from "@/components/purchases/PurchaseSummaryCards";
import { TablePagination } from "@/components/table/TablePagination";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingTable, LoadingCards } from "@/components/states/LoadingCards";
import { applyDateRange, type DateRange } from "@/components/filters/DateRangeFilter";
import { purchaseTotal } from "@/api/purchases";
import { paginateClientSide } from "@/utils/pagination";

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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">E-commerce</h1>
        <p className="text-sm text-muted-foreground">Compras, receita e ticket médio do projeto.</p>
      </div>

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
            <>
              <PurchasesFilters
                search={ui.search}
                dateRange={ui.dateRange}
                onSearchChange={(v) => setUi((p) => ({ ...p, search: v, page: 1 }))}
                onDateRangeChange={(v) => setUi((p) => ({ ...p, dateRange: v, page: 1 }))}
              />
              <div className="flex flex-col gap-2 rounded-md border bg-card/40 p-3 sm:flex-row sm:items-end">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Valor mínimo</Label>
                  <Input
                    value={ui.minValue}
                    onChange={(e) => setUi((p) => ({ ...p, minValue: e.target.value, page: 1 }))}
                    placeholder="0"
                    inputMode="decimal"
                    className="h-9 w-[140px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Valor máximo</Label>
                  <Input
                    value={ui.maxValue}
                    onChange={(e) => setUi((p) => ({ ...p, maxValue: e.target.value, page: 1 }))}
                    placeholder="∞"
                    inputMode="decimal"
                    className="h-9 w-[140px]"
                  />
                </div>
                {(ui.minValue || ui.maxValue) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUi((p) => ({ ...p, minValue: "", maxValue: "", page: 1 }))}
                    className="sm:ml-auto"
                  >
                    Limpar valor
                  </Button>
                )}
              </div>
            </>
          )}

          {query.isLoading ? (
            <LoadingTable />
          ) : query.isError ? null : filtered.length === 0 ? (
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
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                Exibindo {paged.items.length} de {paged.meta?.total ?? filtered.length} compras
                {isServerPaginated ? " (paginação do servidor)" : ""}.
              </div>
              <PurchasesTable purchases={paged.items} />
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
