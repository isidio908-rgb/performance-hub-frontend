import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnosticStatusBadge } from "./DiagnosticStatusBadge";
import type { DiagnosticCheck } from "@/hooks/useSystemDiagnostics";

interface Props {
  check: DiagnosticCheck;
}

export function DiagnosticCheckCard({ check }: Props) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-card/40 p-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{check.label}</span>
          <DiagnosticStatusBadge status={check.status} />
        </div>
        {check.detail && (
          <p className="break-words text-xs text-muted-foreground">{check.detail}</p>
        )}
        {check.description && (
          <p className="text-xs text-muted-foreground/80">{check.description}</p>
        )}
      </div>
      {check.actionLabel && check.actionTo && (
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link to={check.actionTo}>
            {check.actionLabel}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      )}
    </div>
  );
}
