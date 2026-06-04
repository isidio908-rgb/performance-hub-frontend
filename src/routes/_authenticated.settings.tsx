import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, User, Server, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/AuthProvider";
import { getApiEnvironmentStatus } from "@/utils/runtime";

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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Informações da sua conta e do ambiente da API.
        </p>
      </div>

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
        </CardContent>
      </Card>
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
