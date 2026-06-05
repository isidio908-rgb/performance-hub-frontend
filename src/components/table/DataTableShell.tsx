import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LoadingTable } from "@/components/states/LoadingCards";

interface DataTableShellProps {
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  children?: ReactNode;
  pagination?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  summary?: ReactNode;
  className?: string;
}

/**
 * DataTableShell — wrapper visual premium para tabelas.
 * Não altera renderização interna da tabela, apenas padroniza o invólucro.
 */
export function DataTableShell({
  title,
  description,
  toolbar,
  children,
  pagination,
  footer,
  isLoading,
  isEmpty,
  emptyState,
  errorState,
  summary,
  className,
}: DataTableShellProps) {
  const hasHeader = !!title || !!description || !!toolbar;

  return (
    <section className={cn("overflow-hidden rounded-xl border bg-card shadow-sm", className)}>
      {hasHeader && (
        <header className="flex flex-col gap-3 border-b bg-muted/20 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
          {(title || description) && (
            <div className="space-y-0.5">
              {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
          )}
          {toolbar && <div className="w-full sm:w-auto sm:flex-1 sm:pl-4">{toolbar}</div>}
        </header>
      )}

      {errorState ? (
        <div className="p-4">{errorState}</div>
      ) : isLoading ? (
        <div className="p-2">
          <LoadingTable />
        </div>
      ) : isEmpty ? (
        <div className="p-6">{emptyState}</div>
      ) : (
        <div className="overflow-x-auto">
          {summary && (
            <div className="border-b bg-muted/10 px-4 py-2 text-xs text-muted-foreground">
              {summary}
            </div>
          )}
          {children}
        </div>
      )}

      {(pagination || footer) && !errorState && !isEmpty && !isLoading && (
        <footer className="flex flex-col gap-2 border-t bg-muted/10 px-2 py-2">
          {pagination}
          {footer}
        </footer>
      )}
    </section>
  );
}
