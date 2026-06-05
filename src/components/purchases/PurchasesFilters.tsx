import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRangeFilter, type DateRange } from "@/components/filters/DateRangeFilter";

interface Props {
  dateRange: DateRange;
  minValue: string;
  maxValue: string;
  onDateRangeChange: (v: DateRange) => void;
  onMinValueChange: (v: string) => void;
  onMaxValueChange: (v: string) => void;
}

/** Slot de filtros de compras para uso dentro de FilterBar. */
export function PurchasesFilters({
  dateRange,
  minValue,
  maxValue,
  onDateRangeChange,
  onMinValueChange,
  onMaxValueChange,
}: Props) {
  return (
    <>
      <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
      <div className="flex items-end gap-1.5">
        <div className="space-y-1">
          <Label
            htmlFor="purchase-min"
            className="text-[11px] uppercase tracking-wide text-muted-foreground"
          >
            Mín
          </Label>
          <Input
            id="purchase-min"
            value={minValue}
            onChange={(e) => onMinValueChange(e.target.value)}
            placeholder="0"
            inputMode="decimal"
            aria-label="Valor mínimo"
            className="h-9 w-[100px]"
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="purchase-max"
            className="text-[11px] uppercase tracking-wide text-muted-foreground"
          >
            Máx
          </Label>
          <Input
            id="purchase-max"
            value={maxValue}
            onChange={(e) => onMaxValueChange(e.target.value)}
            placeholder="∞"
            inputMode="decimal"
            aria-label="Valor máximo"
            className="h-9 w-[100px]"
          />
        </div>
      </div>
    </>
  );
}
