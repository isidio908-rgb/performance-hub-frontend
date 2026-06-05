import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeFilter, type DateRange } from "@/components/filters/DateRangeFilter";

export const EVENT_TYPES = [
  "PageView",
  "ViewContent",
  "Lead",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "WhatsAppClick",
  "FormSubmit",
] as const;

interface Props {
  type: string;
  dateRange: DateRange;
  onTypeChange: (v: string) => void;
  onDateRangeChange: (v: DateRange) => void;
}

/** Slot de filtros para uso dentro de FilterBar. */
export function EventsFilters({ type, dateRange, onTypeChange, onDateRangeChange }: Props) {
  return (
    <>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="h-9 w-full sm:w-[200px]" aria-label="Filtrar por tipo de evento">
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos os tipos</SelectItem>
          {EVENT_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
    </>
  );
}
