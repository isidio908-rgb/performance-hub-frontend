import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiagnosticCheckCard } from "./DiagnosticCheckCard";
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

interface Props {
  section: DiagnosticSection;
}

export function DiagnosticsSectionCard({ section }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">{section.title}</CardTitle>
          {section.description && <CardDescription>{section.description}</CardDescription>}
        </div>
        <DiagnosticStatusBadge status={sectionStatus(section)} />
      </CardHeader>
      <CardContent className="space-y-2">
        {section.checks.map((c) => (
          <DiagnosticCheckCard key={c.id} check={c} />
        ))}
      </CardContent>
    </Card>
  );
}
