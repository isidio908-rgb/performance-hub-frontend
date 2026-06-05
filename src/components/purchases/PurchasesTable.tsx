import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RevenueBadge } from "./RevenueBadge";
import { purchaseTotal } from "@/api/purchases";
import type { Purchase } from "@/types";
import { densityTableClass, type TableDensity } from "@/hooks/useTableDensity";

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

interface Props {
  purchases: Purchase[];
  density?: TableDensity;
}

export function PurchasesTable({ purchases, density = "comfortable" }: Props) {
  return (
    <Table className={densityTableClass(density)}>
      <TableHeader>
        <TableRow>
          <TableHead>Pedido</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>UTM</TableHead>
          <TableHead>Itens</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Quando</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((p) => {
          const total = purchaseTotal(p);
          const itemsCount = Array.isArray(p.items)
            ? p.items.reduce((a, it) => a + Number(it.quantity ?? 1), 0)
            : 0;
          return (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs">{p.orderId || p.id.slice(0, 8)}</TableCell>
              <TableCell className="text-sm">
                <div>{p.customerName || "—"}</div>
                {p.customerEmail && (
                  <div className="text-xs text-muted-foreground">{p.customerEmail}</div>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {[p.utmSource, p.utmMedium, p.utmCampaign].filter(Boolean).join(" / ") || "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {itemsCount > 0 ? `${itemsCount} item(s)` : "—"}
              </TableCell>
              <TableCell>
                <RevenueBadge value={total} currency={p.currency} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                {formatDateTime(p.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
