import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateRangeFilter, type DateRange } from "@/components/filters/DateRangeFilter";

interface Props {
  search: string;
  dateRange: DateRange;
  onSearchChange: (v: string) => void;
  onDateRangeChange: (v: DateRange) => void;
}

export function PurchasesFilters({ search, dateRange, onSearchChange, onDateRangeChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por orderId, email do cliente, UTM..."
          className="pl-8"
        />
      </div>
      <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
    </div>
  );
}
