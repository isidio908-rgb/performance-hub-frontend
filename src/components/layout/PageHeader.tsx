import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Cabeçalho de página padronizado.
 * Responsivo: title + actions empilham em telas pequenas.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
            {eyebrow}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {badge && (typeof badge === "string" ? <Badge variant="muted">{badge}</Badge> : badge)}
        </div>
        {description && <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </header>
  );
}
