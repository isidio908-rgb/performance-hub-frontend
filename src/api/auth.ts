import { api } from "./client";
import type { AuthResponse, MeResponse, User } from "@/types";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }, { auth: false }),

  register: (input: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("/auth/register", input, { auth: false }),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }, { auth: false }),

  me: async (): Promise<User> => {
    const res = await api.get<MeResponse | User>("/me");
    // Backend pode retornar { user } ou o User direto.
    if (res && typeof res === "object" && "user" in res) {
      return (res as MeResponse).user;
    }
    return res as User;
  },
};
