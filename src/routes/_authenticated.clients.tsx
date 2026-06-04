import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";
import { useSelection } from "@/providers/SelectionProvider";
import { ApiEnvironmentAlert } from "@/components/ApiEnvironmentAlert";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientCard } from "@/components/clients/ClientCard";
import { DeleteClientDialog } from "@/components/clients/DeleteClientDialog";
import type { Client } from "@/types";

export const Route = createFileRoute("/_authenticated/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const { clientId, setClientId, setProjectId } = useSelection();
  const { clientsQuery, clients, createClient, updateClient, deleteClient } =
    useClients();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const onCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os clientes e seus projetos.
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo cliente
        </Button>
      </div>

      {clientsQuery.isError && <ApiEnvironmentAlert error={clientsQuery.error} />}

      {clientsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : clientsQuery.isError ? (
        <ErrorCard onRetry={() => clientsQuery.refetch()} />
      ) : clients.length === 0 ? (
        <EmptyState onCreate={onCreate} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              selected={c.id === clientId}
              onSelect={() => {
                setClientId(c.id);
                toast.success(`Cliente "${c.name}" selecionado`);
              }}
              onEdit={() => {
                setEditing(c);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(c)}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize os dados do cliente."
                : "Adicione um cliente para começar a criar projetos."}
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            initial={editing ?? undefined}
            submitting={createClient.isPending || updateClient.isPending}
            onCancel={() => setFormOpen(false)}
            onSubmit={async (input) => {
              try {
                if (editing) {
                  await updateClient.mutateAsync({ id: editing.id, input });
                  toast.success("Cliente atualizado");
                } else {
                  const created = await createClient.mutateAsync(input);
                  toast.success("Cliente criado");
                  // Auto-seleciona se ainda não há cliente selecionado.
                  if (!clientId && created?.id) setClientId(created.id);
                }
                setFormOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Falha ao salvar");
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <DeleteClientDialog
        client={deleting}
        open={!!deleting}
        loading={deleteClient.isPending}
        onOpenChange={(o) => !o && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteClient.mutateAsync(deleting.id);
            toast.success("Cliente excluído");
            if (clientId === deleting.id) {
              setClientId(null);
              setProjectId(null);
            }
            setDeleting(null);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Falha ao excluir");
          }
        }}
      />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Nenhum cliente ainda</CardTitle>
        <CardDescription>
          Crie seu primeiro cliente para começar a configurar projetos e tracking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" /> Criar cliente
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base text-destructive">
          Erro ao carregar clientes
        </CardTitle>
        <CardDescription>
          Verifique a conexão com a API e tente novamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onRetry}>
          <Loader2 className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}
