import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { label: string; className: string }> = {
  NEW: {
    label: "Novo",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  CONTACTED: {
    label: "Contatado",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  QUALIFIED: {
    label: "Qualificado",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  WON: {
    label: "Ganho",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  LOST: {
    label: "Perdido",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export function LeadStatusBadge({ status }: { status?: string | null }) {
  if (!status) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        —
      </Badge>
    );
  }
  const cfg = MAP[status.toUpperCase()] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}
