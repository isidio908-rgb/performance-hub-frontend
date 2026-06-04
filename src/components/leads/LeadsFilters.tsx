import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  search: string;
  dateRange: DateRange;
  onStatusChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onDateRangeChange: (v: DateRange) => void;
}

export function LeadsFilters({
  status,
  search,
  dateRange,
  onStatusChange,
  onSearchChange,
  onDateRangeChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, email, telefone, fonte..."
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
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
      </div>
      <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
    </div>
  );
}
