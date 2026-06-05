import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { ApiError } from "@/api/client";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { Loader2 } from "lucide-react";

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate({ to: redirect ?? "/dashboard" });
    }
  }, [isReady, isAuthenticated, navigate, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo!");
      navigate({ to: redirect ?? "/dashboard" });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 0
            ? "Não foi possível conectar ao servidor. Verifique a URL da API."
            : err.message
          : "Falha no login";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 opacity-40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-y-1/3 rounded-full bg-chart-5/10 opacity-30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            color: "var(--color-foreground)",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-md space-y-5">
        <ApiEnvironmentAlert />
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 ring-1 ring-inset ring-white/10">
            P
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xl font-semibold tracking-tight">Performance Hub</span>
            <span className="text-xs text-muted-foreground">
              by Performify · Tracking, atribuição e analytics
            </span>
          </div>
        </div>
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/20">
          <CardHeader className="space-y-1.5">
            <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Acesse o painel para acompanhar suas métricas em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-[11px] text-muted-foreground">
          API ·{" "}
          <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">
            {import.meta.env.VITE_API_BASE_URL}
          </code>
        </p>
      </div>
    </div>
  );
}
