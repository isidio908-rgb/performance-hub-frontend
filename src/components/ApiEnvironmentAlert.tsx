import { AlertTriangle, ServerCrash, ShieldAlert, Settings as SettingsIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/api/client";
import { getApiEnvironmentStatus } from "@/utils/runtime";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
  /** Quando informado, infere o motivo a partir do erro. */
  error?: unknown;
  /** Override manual de motivo. */
  variant?: "missing" | "mixed_content" | "unreachable" | "http";
  className?: string;
}

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

/**
 * Alerta técnico reutilizável para problemas de ambiente da API.
 * Mostra diagnóstico claro em vez de esconder a falha.
 */
export function ApiEnvironmentAlert({ error, variant, className }: Props) {
  const env = getApiEnvironmentStatus();
  const { isAuthenticated } = useAuth();

  let resolved: "missing" | "mixed_content" | "unreachable" | "http" | null = variant ?? null;
  let httpStatus: number | undefined;
  let httpMessage: string | undefined;

  if (!resolved) {
    if (!env.configured) resolved = "missing";
    else if (env.mixedContent) resolved = "mixed_content";
    else if (error instanceof ApiError && error.kind === "mixed_content")
      resolved = "mixed_content";
    else if (error instanceof ApiError && error.kind === "missing_base_url") resolved = "missing";
    else if (error instanceof ApiError && (error.kind === "network" || error.status === 0))
      resolved = "unreachable";
    else if (error instanceof ApiError && error.kind === "http") {
      resolved = "http";
      httpStatus = error.status;
      httpMessage = error.message;
    }
  }

  if (!resolved) return null;

  const content = {
    missing: {
      Icon: AlertTriangle,
      title: "API não configurada",
      body: "Defina VITE_API_BASE_URL no .env apontando para a URL HTTPS do backend e reinicie o build.",
    },
    mixed_content: {
      Icon: ShieldAlert,
      title: "API HTTP bloqueada em página HTTPS",
      body: "O navegador bloqueia chamadas a backends HTTP a partir de uma página HTTPS (mixed content). Coloque o backend atrás de um domínio/proxy HTTPS e atualize VITE_API_BASE_URL.",
    },
    unreachable: {
      Icon: ServerCrash,
      title: "Backend inacessível",
      body: "Não foi possível alcançar o backend. Verifique se a URL responde, se o CORS permite este domínio e se há HTTPS disponível.",
    },
    http: {
      Icon: ServerCrash,
      title: `Erro HTTP${httpStatus ? ` ${httpStatus}` : ""} ao chamar a API`,
      body:
        httpMessage ??
        "O backend respondeu com erro. Verifique permissões, payload e logs do servidor.",
    },
  }[resolved];

  const Icon = content.Icon;

  return (
    <Alert variant="destructive" className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{content.title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{content.body}</p>
        <p className="text-xs opacity-80">
          VITE_API_BASE_URL: <code className="font-mono">{maskUrl(env.baseUrl)}</code>
        </p>
        {isAuthenticated && (
          <div>
            <Button asChild size="sm" variant="outline">
              <Link to="/settings">
                <SettingsIcon className="mr-1 h-3 w-3" />
                Abrir diagnóstico
              </Link>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
