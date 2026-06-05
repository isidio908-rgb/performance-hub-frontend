import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCheck, Clipboard, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useE2EChecklist, type ItemState } from "@/hooks/useE2EChecklist";
import { copyToClipboard } from "@/utils/diagnostics";

export function E2EChecklistPanel() {
  const { items, total, passed, percent, setManual, reset, markAllReviewed } = useE2EChecklist();

  async function copySummary() {
    const lines = items.map((i) => {
      const mark =
        i.status === "auto-pass"
          ? "[✓ auto]"
          : i.status === "auto-fail"
            ? "[✗ auto]"
            : i.status === "manual"
              ? "[✓ manual]"
              : "[ ]";
      return `${mark} ${i.title}`;
    });
    const text = `Checklist E2E — ${passed}/${total} (${percent}%)\n${lines.join("\n")}`;
    const ok = await copyToClipboard(text);
    if (ok) toast.success("Resumo copiado");
    else toast.error("Não foi possível copiar");
  }

  function handleMarkAll() {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Marcar todos os itens manuais como revisados?");
      if (!ok) return;
    }
    markAllReviewed();
    toast.success("Itens manuais marcados como revisados");
  }

  function handleReset() {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Resetar checklist E2E?");
      if (!ok) return;
    }
    reset();
    toast.success("Checklist resetado");
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Checklist E2E</CardTitle>
            <CardDescription>
              Valida o fluxo comercial ponta-a-ponta. Itens automáticos refletem o estado real;
              itens manuais ficam por sua conta.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void copySummary()}>
              <Clipboard className="mr-2 h-3.5 w-3.5" />
              Copiar resumo
            </Button>
            <Button size="sm" variant="outline" onClick={handleMarkAll}>
              <CheckCheck className="mr-2 h-3.5 w-3.5" />
              Marcar tudo revisado
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Resetar
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Progresso:{" "}
              <span className="font-medium text-foreground">
                {passed}/{total}
              </span>
            </span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, idx) => {
          const isAuto = item.auto !== null && item.auto !== undefined;
          return (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg border bg-card/40 p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Checkbox
                  id={`e2e-${item.id}`}
                  checked={item.passed}
                  disabled={isAuto}
                  onCheckedChange={(v) => setManual(item.id, !!v)}
                  className="mt-0.5"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <label htmlFor={`e2e-${item.id}`} className="text-sm font-medium">
                      {item.title}
                    </label>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {item.to && item.actionLabel && (
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link to={item.to}>
                    {item.actionLabel}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ItemState }) {
  if (status === "auto-pass")
    return (
      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        Auto ✓
      </Badge>
    );
  if (status === "auto-fail")
    return (
      <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
        Auto ✗
      </Badge>
    );
  if (status === "manual")
    return (
      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        Manual ✓
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-border text-muted-foreground">
      Pendente
    </Badge>
  );
}
