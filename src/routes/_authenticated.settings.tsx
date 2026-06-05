import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  User,
  Server,
  ShieldCheck,
  ShieldAlert,
  PlugZap,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/AuthProvider";
import { getApiEnvironmentStatus } from "@/utils/runtime";
import { PageHeader } from "@/components/layout/PageHeader";
import { SystemDiagnosticsPanel } from "@/components/diagnostics/SystemDiagnosticsPanel";
import { E2EChecklistPanel } from "@/components/diagnostics/E2EChecklistPanel";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function maskUrl(url: string) {
  if (!url) return "(vazio)";
  try {
    const u = new URL(url);
    const host = u.hostname;
    const masked = host.length > 6 ? host.slice(0, 3) + "***" + host.slice(-3) : "***";
    return `${u.protocol}//${masked}${u.port ? ":" + u.port : ""}`;
  } catch {
    return url.length > 12 ? url.slice(0, 6) + "***" + url.slice(-3) : "***";
  }
}

function SettingsPage() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const env = getApiEnvironmentStatus();

  const healthy = env.configured && !env.mixedContent;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Configurações"
        description="Informações da sua conta e do ambiente da API."
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Conta</CardTitle>
            <CardDescription>Dados do usuário autenticado.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Nome" value={user?.name ?? "—"} />
          <Row label="Email" value={user?.email ?? "—"} />
          <Row
            label="Role"
            value={user?.role ? <Badge variant="outline">{user.role}</Badge> : "—"}
          />
          <Separator />
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => void refreshMe()}>
              Recarregar dados
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <Server className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Ambiente</CardTitle>
            <CardDescription>Configuração da API utilizada pelo frontend.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row
            label="Status"
            value={
              healthy ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" /> OK
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                  <ShieldAlert className="mr-1 h-3 w-3" />
                  {env.mixedContent ? "Mixed content" : "Não configurada"}
                </Badge>
              )
            }
          />
          <Row
            label="VITE_API_BASE_URL"
            value={<code className="font-mono text-xs">{maskUrl(env.baseUrl)}</code>}
          />
          <Row label="Página HTTPS" value={env.httpsPage ? "Sim" : "Não"} />
          <Row label="API em HTTP" value={env.httpApi ? "Sim" : "Não"} />
          <Separator />
          <p className="text-xs text-muted-foreground">
            Em produção, a API precisa estar em HTTPS. Páginas servidas em HTTPS não conseguem
            chamar endpoints HTTP por causa de <em>mixed content</em>. Configure o backend atrás de
            Traefik com TLS antes de publicar.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <PlugZap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Contratos Backend</CardTitle>
            <CardDescription>Endpoints suportados por esta versão do frontend.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="outline">V3.4</Badge>
            <Badge variant="outline">V3.4.2</Badge>
          </div>
          <ul className="grid gap-1.5 text-sm">
            {[
              "GET /app/bootstrap",
              "GET /dashboard/kpis",
              "GET /projects/:id/install",
              "POST /projects/:id/test-event",
              "GET /onboarding/status",
              "GET /projects/:id/health",
              "GET/POST/PATCH/DELETE /integrations/configs",
            ].map((endpoint) => (
              <li key={endpoint} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <code className="font-mono text-xs">{endpoint}</code>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            O frontend usa fallbacks locais quando algum endpoint não responde, mantendo
            compatibilidade com versões anteriores.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Diagnóstico do Sistema</h2>
          <p className="text-sm text-muted-foreground">
            Verifica ambiente, sessão, projeto, tracking, onboarding e integrações em tempo real.
          </p>
        </div>
        <SystemDiagnosticsPanel />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Checklist E2E</h2>
          <p className="text-sm text-muted-foreground">
            Roteiro guiado para validar o fluxo comercial ponta-a-ponta no produto.
          </p>
        </div>
        <E2EChecklistPanel />
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
