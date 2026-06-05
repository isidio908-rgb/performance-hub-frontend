import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTotalPages } from "@/utils/pagination";

interface Props {
  page: number;
  pageSize: number;
  total?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
  pageSizeOptions?: number[];
}

const DEFAULT_SIZES = [10, 20, 50, 100];

export function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  disabled,
  pageSizeOptions = DEFAULT_SIZES,
}: Props) {
  const computedTotalPages =
    typeof totalPages === "number" && totalPages > 0
      ? totalPages
      : typeof total === "number"
        ? getTotalPages(total, pageSize)
        : undefined;

  const canPrev = !disabled && page > 1;
  const canNext = !disabled && (computedTotalPages ? page < computedTotalPages : true);

  return (
    <div className="flex flex-col gap-3 border-t bg-card/40 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>Itens por página</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {typeof total === "number" && (
          <span className="ml-2">
            {total} {total === 1 ? "item" : "itens"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">
          {computedTotalPages ? `Página ${page} de ${computedTotalPages}` : `Página ${page}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={!canPrev}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
