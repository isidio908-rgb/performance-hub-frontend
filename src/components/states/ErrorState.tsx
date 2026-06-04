import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/api/client";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";

interface Props {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({ title = "Erro ao carregar", error, onRetry }: Props) {
  const msg =
    error instanceof ApiError
      ? `${error.status || ""} ${error.message}`.trim()
      : error instanceof Error
        ? error.message
        : "Erro desconhecido.";
  return (
    <div className="space-y-4">
      <ApiEnvironmentAlert error={error} />
      <Card className="border-destructive/40">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base text-destructive">{title}</CardTitle>
            <CardDescription>{msg}</CardDescription>
          </div>
        </CardHeader>
        {onRetry && (
          <CardContent>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
