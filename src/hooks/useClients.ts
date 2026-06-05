import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "@/api/clients";
import type { Client, CreateClientInput, UpdateClientInput } from "@/types";

function normalize(res: Client[] | { data: Client[] } | undefined): Client[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export function useClients() {
  const qc = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.list(),
  });

  const clients = useMemo(() => normalize(clientsQuery.data), [clientsQuery.data]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["app", "bootstrap"] });
    qc.invalidateQueries({ queryKey: ["onboarding", "status"] });
  };

  const createClient = useMutation({
    mutationFn: (input: CreateClientInput) => clientsApi.create(input),
    onSuccess: invalidate,
  });

  const updateClient = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClientInput }) =>
      clientsApi.update(id, input),
    onSuccess: invalidate,
  });

  const deleteClient = useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    clientsQuery,
    clients,
    createClient,
    updateClient,
    deleteClient,
  };
}
