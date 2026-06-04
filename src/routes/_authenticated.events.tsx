import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/providers/SelectionProvider";
import { useEvents } from "@/hooks/useEvents";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { EventsFilters } from "@/components/events/EventsFilters";
import { EventsTable } from "@/components/events/EventsTable";

export const Route = createFileRoute("/_authenticated/events")({
  component: EventsPage,
});

function EventsPage() {
  const { projectId, clientId } = useSelection();
  const { query, events } = useEvents(projectId);

  const [typeFilter, setTypeFilter] = useState<string>("__all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== "__all" && String(e.type) !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [e.name, e.currentUrl, e.visitorId, e.sessionId]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, typeFilter, search]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
        <p className="text-sm text-muted-foreground">
          Últimas atividades capturadas pelo tracker.
        </p>
      </div>

      {!clientId || !projectId ? (
        <EmptySelection />
      ) : (
        <>
          {query.isError && <ApiEnvironmentAlert error={query.error} />}

          <EventsFilters
            type={typeFilter}
            search={search}
            onTypeChange={setTypeFilter}
            onSearchChange={setSearch}
          />

          {query.isLoading ? (
            <Skeleton className="h-72 w-full rounded-md" />
          ) : query.isError ? (
            <ErrorCard onRetry={() => query.refetch()} />
          ) : filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Nenhum evento</CardTitle>
                <CardDescription>
                  {events.length === 0
                    ? "Este projeto ainda não recebeu eventos. Instale o script para começar."
                    : "Nenhum evento corresponde aos filtros atuais."}
                </CardDescription>
              </CardHeader>
              {events.length === 0 && (
                <CardContent>
                  <Button asChild size="sm">
                    <Link to="/install">Instalar tracking</Link>
                  </Button>
                </CardContent>
              )}
            </Card>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Exibindo {filtered.length} de {events.length} eventos.
              </p>
              <EventsTable events={filtered} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function EmptySelection() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Selecione um projeto</CardTitle>
        <CardDescription>
          Use o seletor no topo para escolher cliente e projeto.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base text-destructive">
          Erro ao carregar eventos
        </CardTitle>
        <CardDescription>
          Verifique a conexão com a API e tente novamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}
