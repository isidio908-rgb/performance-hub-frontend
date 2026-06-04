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
        "transition-shadow hover:shadow-md",
        to && "cursor-pointer hover:border-primary/40",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value ?? "—"}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
  if (to) {
    return (
      <Link to={to} className="block">
        {card}
      </Link>
    );
  }
  return card;
}
