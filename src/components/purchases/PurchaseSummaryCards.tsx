import { ShoppingBag, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import type { Purchase } from "@/types";
import { computePurchaseMetrics } from "@/hooks/usePurchases";

function formatCurrency(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(n);
  } catch {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n);
  }
}

const fmtNumber = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

export function PurchaseSummaryCards({ purchases }: { purchases: Purchase[] }) {
  const { totalRevenue, totalPurchases, averageTicket, highestPurchase, mainCurrency } =
    computePurchaseMetrics(purchases);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Receita total"
        value={formatCurrency(totalRevenue, mainCurrency)}
        icon={DollarSign}
      />
      <KpiCard label="Compras" value={fmtNumber(totalPurchases)} icon={ShoppingBag} />
      <KpiCard
        label="Ticket médio"
        value={formatCurrency(averageTicket, mainCurrency)}
        icon={Receipt}
      />
      <KpiCard
        label="Maior compra"
        value={formatCurrency(highestPurchase, mainCurrency)}
        icon={TrendingUp}
      />
    </div>
  );
}
