import { CalendarRange, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface DateRange {
  from: string | null; // YYYY-MM-DD
  to: string | null;
}

interface Props {
  value: DateRange;
  onChange: (v: DateRange) => void;
  className?: string;
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function preset(kind: "today" | "7d" | "30d" | "month"): DateRange {
  const now = new Date();
  const to = isoDay(now);
  if (kind === "today") return { from: to, to };
  if (kind === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return { from: isoDay(d), to };
  }
  if (kind === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    return { from: isoDay(d), to };
  }
  // month
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: isoDay(first), to };
}

export function DateRangeFilter({ value, onChange, className }: Props) {
  return (
    <div
      className={
        "flex flex-col gap-2 rounded-md border bg-card p-3 sm:flex-row sm:items-end " +
        (className ?? "")
      }
    >
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">De</Label>
          <Input
            type="date"
            value={value.from ?? ""}
            onChange={(e) => onChange({ ...value, from: e.target.value || null })}
            className="h-9 w-[150px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Até</Label>
          <Input
            type="date"
            value={value.to ?? ""}
            onChange={(e) => onChange({ ...value, to: e.target.value || null })}
            className="h-9 w-[150px]"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
        <CalendarRange className="hidden h-4 w-4 text-muted-foreground sm:block" />
        <Button variant="outline" size="sm" onClick={() => onChange(preset("today"))}>
          Hoje
        </Button>
        <Button variant="outline" size="sm" onClick={() => onChange(preset("7d"))}>
          7d
        </Button>
        <Button variant="outline" size="sm" onClick={() => onChange(preset("30d"))}>
          30d
        </Button>
        <Button variant="outline" size="sm" onClick={() => onChange(preset("month"))}>
          Mês
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ from: null, to: null })}
          disabled={!value.from && !value.to}
        >
          <X className="mr-1 h-3 w-3" />
          Limpar
        </Button>
      </div>
    </div>
  );
}

/** Aplica filtro de data client-side a uma lista. */
export function applyDateRange<T extends { createdAt?: string }>(
  items: T[],
  range: DateRange,
): T[] {
  if (!range.from && !range.to) return items;
  const fromMs = range.from ? new Date(range.from + "T00:00:00").getTime() : -Infinity;
  const toMs = range.to ? new Date(range.to + "T23:59:59.999").getTime() : Infinity;
  return items.filter((it) => {
    if (!it.createdAt) return false;
    const t = new Date(it.createdAt).getTime();
    if (Number.isNaN(t)) return false;
    return t >= fromMs && t <= toMs;
  });
}
