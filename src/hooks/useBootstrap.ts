import { useQuery } from "@tanstack/react-query";
import { bootstrapApi } from "@/api/bootstrap";
import { tokenStorage } from "@/api/client";

export const BOOTSTRAP_QUERY_KEY = ["app", "bootstrap"] as const;

/**
 * GET /app/bootstrap
 *
 * Uso seguro: dados agregados (usuário + clients + projects) para enriquecer
 * UI. Não usar para validar sessão — isso continua sendo /me no AuthProvider.
 *
 * Roda apenas quando há accessToken e o backend está configurado. Falhas são
 * silenciosas (retry=0) para não bloquear a UI; clientes/projetos têm seus
 * próprios hooks como fonte primária.
 */
export function useBootstrap() {
  return useQuery({
    queryKey: BOOTSTRAP_QUERY_KEY,
    queryFn: () => bootstrapApi.get(),
    enabled: typeof window !== "undefined" && !!tokenStorage.access,
    retry: 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
