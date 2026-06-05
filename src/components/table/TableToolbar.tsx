import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  title?: string;
  description?: string;
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (v: string) => void;
  children?: ReactNode;
  rightSlot?: ReactNode;
}

export function TableToolbar({
  title,
  description,
  search,
  searchPlaceholder,
  onSearchChange,
  children,
  rightSlot,
}: Props) {
  return (
    <div className="space-y-3 rounded-md border bg-card/40 p-3">
      {(title || description || rightSlot) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          {(title || description) && (
            <div>
              {title && <h3 className="text-sm font-medium">{title}</h3>}
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
          )}
          {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        {onSearchChange !== undefined && (
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder ?? "Buscar..."}
              className="h-9 pl-8"
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
