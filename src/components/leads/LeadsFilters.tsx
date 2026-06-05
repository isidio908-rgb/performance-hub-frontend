import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeFilter, type DateRange } from "@/components/filters/DateRangeFilter";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;

interface Props {
  status: string;
  dateRange: DateRange;
  onStatusChange: (v: string) => void;
  onDateRangeChange: (v: DateRange) => void;
}

/** Slot de filtros para uso dentro de FilterBar. */
export function LeadsFilters({ status, dateRange, onStatusChange, onDateRangeChange }: Props) {
  return (
    <>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 w-full sm:w-[180px]" aria-label="Filtrar por status do lead">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos os status</SelectItem>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
    </>
  );
}
