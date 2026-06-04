import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CLIENT_KEY = "vps_selected_client_id";
const PROJECT_KEY = "vps_selected_project_id";

interface SelectionContextValue {
  clientId: string | null;
  projectId: string | null;
  setClientId: (id: string | null) => void;
  setProjectId: (id: string | null) => void;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(
  undefined,
);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [clientId, setClientIdState] = useState<string | null>(null);
  const [projectId, setProjectIdState] = useState<string | null>(null);

  useEffect(() => {
    setClientIdState(localStorage.getItem(CLIENT_KEY));
    setProjectIdState(localStorage.getItem(PROJECT_KEY));
  }, []);

  const setClientId = useCallback((id: string | null) => {
    setClientIdState(id);
    if (id) localStorage.setItem(CLIENT_KEY, id);
    else localStorage.removeItem(CLIENT_KEY);
    // reset project when client changes
    localStorage.removeItem(PROJECT_KEY);
    setProjectIdState(null);
  }, []);

  const setProjectId = useCallback((id: string | null) => {
    setProjectIdState(id);
    if (id) localStorage.setItem(PROJECT_KEY, id);
    else localStorage.removeItem(PROJECT_KEY);
  }, []);

  const value = useMemo(
    () => ({ clientId, projectId, setClientId, setProjectId }),
    [clientId, projectId, setClientId, setProjectId],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used inside SelectionProvider");
  return ctx;
}
