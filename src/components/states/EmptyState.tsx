import { Inbox } from "lucide-react";
import type { ReactNode, ComponentType } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Ação primária (usar shadcn Button). */
  action?: ReactNode;
  /** Ação secundária opcional (ex: link para documentação). */
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  secondaryAction,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center",
        className,
      )}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground ring-1 ring-border/50"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
