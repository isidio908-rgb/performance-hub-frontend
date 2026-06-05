import { useState, type ReactNode } from "react";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/api/client";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { copyToClipboard } from "@/utils/diagnostics";
import { toast } from "sonner";

interface Props {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  /** Ação extra (ex: voltar, abrir diagnóstico). */
  secondaryAction?: ReactNode;
  /** Permite ocultar o botão de copiar detalhes técnicos. */
  showCopyDetails?: boolean;
}

function resolveMessage(error: unknown): { code?: string | number; text: string } {
  if (error instanceof ApiError) {
    if (error.kind === "missing_base_url") {
      return { code: "config", text: "API não configurada. Defina VITE_API_BASE_URL." };
    }
    if (error.kind === "mixed_content") {
      return { code: "mixed_content", text: "Backend HTTP bloqueado em página HTTPS." };
    }
    if (error.kind === "network") {
      return { code: "network", text: "Backend inacessível. Verifique conexão, HTTPS e CORS." };
    }
    switch (error.status) {
      case 401:
        return { code: 401, text: "Sessão expirada. Faça login novamente." };
      case 403:
        return { code: 403, text: "Você não tem permissão para acessar este recurso." };
      case 404:
        return { code: 404, text: "Recurso não encontrado." };
      case 500:
      case 502:
      case 503:
      case 504:
        return { code: error.status, text: "Erro no servidor. Tente novamente em instantes." };
    }
    return { code: error.status || "http", text: error.message || "Erro HTTP." };
  }
  if (error instanceof Error) return { text: error.message };
  return { text: "Erro desconhecido." };
}

export function ErrorState({
  title = "Erro ao carregar",
  error,
  onRetry,
  secondaryAction,
  showCopyDetails = true,
}: Props) {
  const [copied, setCopied] = useState(false);
  const { code, text } = resolveMessage(error);

  async function handleCopy() {
    const payload = {
      title,
      code,
      message: text,
      raw:
        error instanceof ApiError
          ? { kind: error.kind, status: error.status, body: error.body, message: error.message }
          : error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error,
      timestamp: new Date().toISOString(),
    };
    const ok = await copyToClipboard(JSON.stringify(payload, null, 2));
    if (ok) {
      setCopied(true);
      toast.success("Detalhes copiados");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Não foi possível copiar");
    }
  }

  return (
    <div className="space-y-4">
      <ApiEnvironmentAlert error={error} />
      <Card className="border-destructive/40">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base text-destructive">
              {title}
              {code !== undefined && (
                <span className="ml-2 font-mono text-xs text-muted-foreground">[{code}]</span>
              )}
            </CardTitle>
            <CardDescription>{text}</CardDescription>
          </div>
        </CardHeader>
        {(onRetry || secondaryAction || (showCopyDetails && !!error)) && (
          <CardContent className="flex flex-wrap gap-2">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Tentar novamente
              </Button>
            )}
            {secondaryAction as ReactNode}
            {showCopyDetails && !!error && (
              <Button variant="ghost" size="sm" onClick={() => void handleCopy()}>
                {copied ? (
                  <Check className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <Copy className="mr-2 h-3.5 w-3.5" />
                )}
                Copiar detalhes
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
