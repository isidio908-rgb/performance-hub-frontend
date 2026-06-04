import { AlertTriangle, ServerCrash, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiError } from "@/api/client";
import { getApiEnvironmentStatus } from "@/utils/runtime";

interface Props {
  /** Quando informado, infere o motivo a partir do erro. */
  error?: unknown;
  /** Override manual de motivo. */
  variant?: "missing" | "mixed_content" | "unreachable";
  className?: string;
}

/**
 * Alerta técnico reutilizável para problemas de ambiente da API.
 * Mostra diagnóstico claro em vez de esconder a falha.
 */
export function ApiEnvironmentAlert({ error, variant, className }: Props) {
  const env = getApiEnvironmentStatus();

  let resolved: "missing" | "mixed_content" | "unreachable" | null = variant ?? null;

  if (!resolved) {
    if (!env.configured) resolved = "missing";
    else if (env.mixedContent) resolved = "mixed_content";
    else if (error instanceof ApiError && error.kind === "mixed_content")
      resolved = "mixed_content";
    else if (error instanceof ApiError && error.kind === "missing_base_url") resolved = "missing";
    else if (error instanceof ApiError && (error.kind === "network" || error.status === 0))
      resolved = "unreachable";
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
      body: "O Lovable roda em HTTPS e o navegador bloqueia chamadas a backends HTTP (mixed content). Coloque o backend atrás de um domínio HTTPS ou de um proxy HTTPS e atualize VITE_API_BASE_URL.",
    },
    unreachable: {
      Icon: ServerCrash,
      title: "Backend inacessível",
      body: "Não foi possível alcançar o backend. Verifique se a URL responde, se o CORS permite este domínio e se há HTTPS disponível.",
    },
  }[resolved];

  const Icon = content.Icon;

  return (
    <Alert variant="destructive" className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{content.title}</AlertTitle>
      <AlertDescription className="space-y-1">
        <p>{content.body}</p>
        <p className="text-xs opacity-80">
          VITE_API_BASE_URL: <code className="font-mono">{env.baseUrl || "(vazio)"}</code>
        </p>
      </AlertDescription>
    </Alert>
  );
}
