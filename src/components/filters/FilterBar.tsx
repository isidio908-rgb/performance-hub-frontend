import type { ReactNode } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  children?: ReactNode;
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  rightSlot?: ReactNode;
  className?: string;
}

/**
 * FilterBar — barra de filtros padrão.
 * - Input de busca opcional com ícone
 * - Slot para filtros adicionais (selects, date range, etc.)
 * - Chip de contagem de filtros ativos
 * - Botão "Limpar tudo" quando há filtros
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  searchAriaLabel,
  children,
  activeFiltersCount = 0,
  onClearFilters,
  rightSlot,
  className,
}: FilterBarProps) {
  const hasSearch = typeof onSearchChange === "function";
  const hasActive = activeFiltersCount > 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/60 p-3 shadow-[inset_0_1px_0_0_hsl(var(--border)/0.4)]",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        {hasSearch && (
          <div className="relative w-full lg:max-w-xs">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel ?? searchPlaceholder}
              className="h-9 pl-8"
            />
          </div>
        )}

        {children && <div className="flex flex-1 flex-wrap items-end gap-2">{children}</div>}

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {hasActive && (
            <Badge variant="info" className="gap-1.5">
              <SlidersHorizontal className="h-3 w-3" />
              {activeFiltersCount} {activeFiltersCount === 1 ? "filtro ativo" : "filtros ativos"}
            </Badge>
          )}
          {hasActive && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              aria-label="Limpar todos os filtros"
            >
              <X className="mr-1 h-3 w-3" />
              Limpar tudo
            </Button>
          )}
          {rightSlot}
        </div>
      </div>
    </div>
  );
}
