import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { usePurchases } from "@/hooks/usePurchases";
import { PurchasesFilters } from "@/components/purchases/PurchasesFilters";
import { PurchasesTable } from "@/components/purchases/PurchasesTable";
import { PurchaseSummaryCards } from "@/components/purchases/PurchaseSummaryCards";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingTable, LoadingCards } from "@/components/states/LoadingCards";
import { applyDateRange, type DateRange } from "@/components/filters/DateRangeFilter";

export const Route = createFileRoute("/_authenticated/ecommerce")({
  component: EcommercePage,
});

function EcommercePage() {
  const { projectId, clientId } = useSelection();
  const { query, purchases } = usePurchases(projectId);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const filtered = useMemo(() => {
    let list = purchases;
    list = applyDateRange(list, dateRange);
    return list.filter((p) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
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
  }, [purchases, search, dateRange]);

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
            <PurchasesFilters
              search={search}
              dateRange={dateRange}
              onSearchChange={setSearch}
              onDateRangeChange={setDateRange}
            />
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
            <>
              <p className="text-xs text-muted-foreground">
                Exibindo {filtered.length} de {purchases.length} compras.
              </p>
              <PurchasesTable purchases={filtered} />
            </>
          )}
        </>
      )}
    </div>
  );
}
