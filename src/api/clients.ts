import { api } from "./client";
import type { Client } from "@/types";

export const clientsApi = {
  list: () => api.get<Client[] | { data: Client[] }>("/clients"),
};
