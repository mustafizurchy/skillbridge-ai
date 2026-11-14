import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { View } from "../../shared/types";
import { api, setCsrf, ApiError } from "../services/api";
interface Context {
  view: View | null;
  loading: boolean;
  busy: boolean;
  error: string;
  notice: string;
  refresh: () => Promise<View | null>;
  run: <T>(work: () => Promise<T>, message?: string) => Promise<T | undefined>;
  clear: () => void;
}
const WorkspaceContext = createContext<Context>(null!);
export function Provider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const refresh = useCallback(async () => {
    try {
      const data = await api<View>("/workspace");
      setCsrf(data.csrf);
      setView(data);
      return data;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setView(null);
        return null;
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);
  async function run<T>(work: () => Promise<T>, message = "Saved") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await work();
      await refresh();
      setNotice(message);
      return result;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save. Please retry.",
      );
      return undefined;
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceContext.Provider
      value={{
        view,
        loading,
        busy,
        error,
        notice,
        refresh,
        run,
        clear: () => {
          setView(null);
          setNotice("");
          setError("");
        },
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
export const useWorkspace = () => useContext(WorkspaceContext);
