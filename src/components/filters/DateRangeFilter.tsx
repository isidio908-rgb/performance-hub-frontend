import { CalendarRange, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: string | null; // YYYY-MM-DD
  to: string | null;
}

interface Props {
  value: DateRange;
  onChange: (v: DateRange) => void;
  className?: string;
  align?: "start" | "center" | "end";
}

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIso(s: string | null): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
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
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: isoDay(first), to };
}

function rangeLabel(v: DateRange): string {
  const from = parseIso(v.from);
  const to = parseIso(v.to);
  if (!from && !to) return "Período";
  if (from && to) {
    if (v.from === v.to) {
      return format(from, "dd MMM yyyy", { locale: ptBR });
    }
    return `${format(from, "dd MMM", { locale: ptBR })} – ${format(to, "dd MMM yyyy", {
      locale: ptBR,
    })}`;
  }
  if (from) return `Desde ${format(from, "dd MMM yyyy", { locale: ptBR })}`;
  if (to) return `Até ${format(to, "dd MMM yyyy", { locale: ptBR })}`;
  return "Período";
}

export function DateRangeFilter({ value, onChange, className, align = "start" }: Props) {
  const hasValue = !!value.from || !!value.to;
  const selected: DayPickerRange | undefined = hasValue
    ? { from: parseIso(value.from), to: parseIso(value.to) }
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Selecionar período"
          className={cn(
            "h-9 min-w-[180px] justify-start gap-2 font-normal",
            !hasValue && "text-muted-foreground",
            className,
          )}
        >
          <CalendarRange className="h-4 w-4" />
          <span className="truncate">{rangeLabel(value)}</span>
          {hasValue && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Limpar período"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange({ from: null, to: null });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange({ from: null, to: null });
                }
              }}
              className="ml-auto inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-auto p-0"
        // calendar inside popover sometimes blocks pointer events in dialogs
      >
        <div className="flex flex-col gap-0 sm:flex-row">
          <div className="flex flex-col gap-1 border-b p-2 sm:border-b-0 sm:border-r">
            <PresetButton label="Hoje" onClick={() => onChange(preset("today"))} />
            <PresetButton label="Últimos 7 dias" onClick={() => onChange(preset("7d"))} />
            <PresetButton label="Últimos 30 dias" onClick={() => onChange(preset("30d"))} />
            <PresetButton label="Este mês" onClick={() => onChange(preset("month"))} />
            <Separator className="my-1" />
            <PresetButton
              label="Limpar"
              variant="ghost"
              onClick={() => onChange({ from: null, to: null })}
              disabled={!hasValue}
            />
          </div>
          <Calendar
            mode="range"
            numberOfMonths={1}
            selected={selected}
            onSelect={(r) =>
              onChange({
                from: r?.from ? isoDay(r.from) : null,
                to: r?.to ? isoDay(r.to) : r?.from ? isoDay(r.from) : null,
              })
            }
            initialFocus
            locale={ptBR}
            className={cn("pointer-events-auto p-3")}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PresetButton({
  label,
  onClick,
  disabled,
  variant = "ghost",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "ghost" | "outline";
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className="justify-start text-xs font-normal"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
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
