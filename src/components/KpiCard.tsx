import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface KpiCardProps {
  label: string;
  value: string | number | undefined;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
  to?: string;
}

export function KpiCard({ label, value, icon: Icon, hint, className, to }: KpiCardProps) {
  const card = (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-[0_4px_24px_-8px_oklch(0.66_0.16_258/0.35)]",
        to && "cursor-pointer",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </CardTitle>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/50 text-muted-foreground transition-colors group-hover:bg-primary/15 group-hover:text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{value ?? "—"}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
  if (to) {
    return (
      <Link
        to={to}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
      >
        {card}
      </Link>
    );
  }
  return card;
}
