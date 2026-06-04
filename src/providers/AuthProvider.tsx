import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, tokenStorage } from "@/api/client";
import { authApi } from "@/api/auth";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const bootstrap = useCallback(async () => {
    const cached = tokenStorage.user as User | null;
    if (cached) setUser(cached);

    if (!tokenStorage.access) {
      setUser(null);
      setIsReady(true);
      return;
    }

    try {
      const me = await authApi.me();
      setUser(me);
      // Atualiza cache local sem alterar tokens.
      const access = tokenStorage.access!;
      const refresh = tokenStorage.refresh ?? "";
      tokenStorage.setSession(access, refresh, me);
    } catch (err) {
      if (err instanceof ApiError) {
        // 401 => sessão inválida: limpar.
        if (err.status === 401) {
          tokenStorage.clear();
          setUser(null);
        }
        // mixed_content / missing_base_url / network => mantemos sem loop:
        // o alerta de ambiente vai aparecer nas telas; não derrubamos sessão
        // só porque a API não está acessível.
      } else {
        tokenStorage.clear();
        setUser(null);
      }
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    tokenStorage.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!tokenStorage.access) return;
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      /* silencioso — UI de erro fica nas queries */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isReady,
      login,
      logout,
      refreshMe,
    }),
    [user, isReady, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
