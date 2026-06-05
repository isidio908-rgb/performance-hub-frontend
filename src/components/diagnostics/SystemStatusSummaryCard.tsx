import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight, ListChecks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSystemDiagnostics } from "@/hooks/useSystemDiagnostics";
import { useE2EChecklist } from "@/hooks/useE2EChecklist";
import { DiagnosticStatusBadge } from "./DiagnosticStatusBadge";
import type { DiagnosticSection, DiagnosticStatus } from "@/hooks/useSystemDiagnostics";

function sectionStatus(section: DiagnosticSection): DiagnosticStatus {
  const statuses = section.checks.map((c) => c.status);
  if (statuses.includes("error")) return "error";
  if (statuses.includes("warning")) return "warning";
  if (statuses.includes("pending")) return "pending";
  if (statuses.every((s) => s === "idle")) return "idle";
  return "success";
}

const PINNED = ["environment", "session", "project", "tracking", "integrations"];
const LABELS: Record<string, string> = {
  environment: "API",
  session: "Sessão",
  project: "Projeto",
  tracking: "Tracking",
  integrations: "Integrações",
};

interface HealthLabel {
  text: string;
  className: string;
}

function healthLabel(rate: number, hasError: boolean): HealthLabel {
  if (hasError || rate < 60)
    return {
      text: "Crítico",
      className: "border-red-500/30 bg-red-500/10 text-red-400",
    };
  if (rate < 90)
    return {
      text: "Atenção",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    };
  return {
    text: "Saudável",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  };
}

export function SystemStatusSummaryCard() {
  const { sections, summary } = useSystemDiagnostics();
  const e2e = useE2EChecklist();
  const pinned = PINNED.map((id) => sections.find((s) => s.id === id)).filter(
    (s): s is DiagnosticSection => !!s,
  );
  const label = healthLabel(summary.successRate, summary.error > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">Status do sistema</CardTitle>
            <CardDescription>
              Resumo de API, sessão, projeto, tracking e integrações.
            </CardDescription>
          </div>
        </div>
        <Badge variant="outline" className={label.className}>
          {label.text} · {summary.successRate}%
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {summary.success}/{summary.total} checks OK
            </span>
            <span>
              {summary.warning > 0 && `${summary.warning} atenção · `}
              {summary.error > 0 && `${summary.error} erro(s)`}
            </span>
          </div>
          <Progress value={summary.successRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {pinned.map((s) => (
            <div key={s.id} className="flex flex-col gap-1 rounded-md border bg-card/40 p-2">
              <span className="text-xs text-muted-foreground">{LABELS[s.id] ?? s.title}</span>
              <DiagnosticStatusBadge status={sectionStatus(s)} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card/40 p-3">
          <div className="flex items-start gap-3">
            <ListChecks className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Checklist E2E</p>
              <p className="text-xs text-muted-foreground">
                {e2e.passed}/{e2e.total} itens validados ({e2e.percent}%)
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/settings">
              Abrir checklist <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="flex justify-end">
          <Button asChild size="sm" variant="ghost">
            <Link to="/settings">
              Ver diagnóstico completo <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
