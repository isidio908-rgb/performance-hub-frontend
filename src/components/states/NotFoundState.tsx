import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
  title?: string;
  description?: string;
}

export function NotFoundState({
  title = "Página não encontrada",
  description = "O endereço acessado não existe, foi movido ou você não tem permissão para vê-lo.",
}: Props) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/60 bg-card/40">
        <CardHeader className="items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground ring-1 ring-border/50">
            <Compass className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild>
                <Link to="/dashboard">Voltar ao Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/settings">Ir para Diagnóstico</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link to="/login">Ir para login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Início</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
