import { api } from "./client";
import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "@/types";

type ListResponse = Client[] | { data: Client[] };

export const clientsApi = {
  list: () => api.get<ListResponse>("/clients"),
  get: (id: string) => api.get<Client | { data: Client }>(`/clients/${id}`),
  create: (input: CreateClientInput) => api.post<Client>("/clients", input),
  update: (id: string, input: UpdateClientInput) =>
    api.patch<Client>(`/clients/${id}`, input),
  remove: (id: string) => api.delete<void>(`/clients/${id}`),
};
