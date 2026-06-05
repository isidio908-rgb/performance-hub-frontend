import { useEffect, useState } from "react";
import { Download, RefreshCw, Clipboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSystemDiagnostics } from "@/hooks/useSystemDiagnostics";
import { useAuth } from "@/providers/AuthProvider";
import { useSelection } from "@/providers/SelectionProvider";
import { getApiEnvironmentStatus } from "@/utils/runtime";
import { buildDiagnosticsExportPayload, copyToClipboard, downloadJson } from "@/utils/diagnostics";
import { DiagnosticsSectionCard } from "./DiagnosticsSection";
import { DiagnosticStatusBadge } from "./DiagnosticStatusBadge";

const AUTO_REFRESH_KEY = "vps_diagnostics_auto_refresh";
const AUTO_REFRESH_MS = 30_000;

function readAutoRefresh(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(AUTO_REFRESH_KEY) === "true";
  } catch {
    return false;
  }
}

function formatTime(ts: number | null): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleTimeString("pt-BR");
  } catch {
    return "—";
  }
}

export function SystemDiagnosticsPanel() {
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => readAutoRefresh());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(AUTO_REFRESH_KEY, autoRefresh ? "true" : "false");
    } catch {
      /* ignore */
    }
  }, [autoRefresh]);

  const { sections, summary, isFetching, refetchAll, lastCheckedAt } = useSystemDiagnostics({
    refetchIntervalMs: autoRefresh ? AUTO_REFRESH_MS : undefined,
  });

  const { user } = useAuth();
  const { clientId, projectId } = useSelection();

  const overallLabel =
    summary.overall === "success"
      ? "Tudo OK"
      : summary.overall === "warning"
        ? `${summary.warning} atenção`
        : summary.overall === "error"
          ? `${summary.error} erro(s)`
          : summary.overall === "pending"
            ? "Verificando"
            : "—";

  async function handleExport(action: "copy" | "download") {
    const env = getApiEnvironmentStatus();
    const payload = buildDiagnosticsExportPayload({
      baseUrl: env.baseUrl,
      apiEnv: {
        configured: env.configured,
        mixedContent: env.mixedContent,
        httpsPage: env.httpsPage,
        httpApi: env.httpApi,
      },
      user: user ?? undefined,
      clientId,
      projectId,
      summary,
      sections,
    });

    if (action === "copy") {
      const ok = await copyToClipboard(JSON.stringify(payload, null, 2));
      if (ok) toast.success("Diagnóstico copiado para o clipboard");
      else toast.error("Não foi possível copiar — use Baixar JSON");
      return;
    }

    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadJson(`diagnostico-${stamp}.json`, payload);
      toast.success("Arquivo de diagnóstico baixado");
    } catch {
      toast.error("Falha ao baixar diagnóstico");
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/40 p-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Resumo:</span>
          <DiagnosticStatusBadge status={summary.overall} label={overallLabel} />
          <span className="text-xs text-muted-foreground">
            {summary.success}/{summary.total} checks OK ({summary.successRate}%)
          </span>
          <span className="text-xs text-muted-foreground">
            · Última verificação: {formatTime(lastCheckedAt)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="diag-auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="diag-auto-refresh" className="text-xs text-muted-foreground">
              Atualizar a cada 30s
            </Label>
          </div>
          <Button size="sm" variant="outline" onClick={() => void handleExport("copy")}>
            <Clipboard className="mr-2 h-3.5 w-3.5" />
            Copiar JSON
          </Button>
          <Button size="sm" variant="outline" onClick={() => void handleExport("download")}>
            <Download className="mr-2 h-3.5 w-3.5" />
            Exportar diagnóstico
          </Button>
          <Button size="sm" variant="outline" onClick={refetchAll} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Revalidar agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sections.map((s) => (
          <DiagnosticsSectionCard key={s.id} section={s} />
        ))}
      </div>
    </section>
  );
}
