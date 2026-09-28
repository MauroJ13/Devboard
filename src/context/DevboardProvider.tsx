import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { DevboardContext, type SyncState } from "@/context/devboardContext";
import { appReducer } from "@/reducers/appReducer";
import { actions, type AppAction } from "@/reducers/actions";
import { usePersistentReducer } from "@/hooks/usePersistentReducer";
import { createInitialState } from "@/data/initialState";
import { loadState, saveState } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { loadRemoteState, syncAction } from "@/services/supabaseSync";
import type { AppState } from "@/types";

function initState(): AppState {
  return loadState() ?? createInitialState();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Stellt den zentralen App-State (useReducer) für die gesamte App bereit.
 * - localStorage: immer (Cache + Offline-Fallback)
 * - Supabase: zusätzlich, sobald VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY gesetzt sind
 */
export function DevboardProvider({ children }: { children: ReactNode }) {
  const [state, baseDispatch] = usePersistentReducer(appReducer, initState, saveState);
  const [sync, setSync] = useState<SyncState>({
    mode: supabase ? "supabase" : "local",
    status: supabase ? "loading" : "idle",
    error: null,
  });

  /** Actions, die noch in die Datenbank geschrieben werden müssen */
  const pendingActions = useRef<AppAction[]>([]);
  /** Schreibvorgänge nacheinander ausführen, damit die Reihenfolge erhalten bleibt */
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  // 1) Beim Start Daten aus Supabase laden
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let cancelled = false;

    loadRemoteState(client)
      .then((remote) => {
        if (cancelled) return;
        baseDispatch(actions.hydrate(remote));
        setSync((prev) => ({ ...prev, status: "idle", error: null }));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSync((prev) => ({ ...prev, status: "error", error: errorMessage(error) }));
      });

    return () => {
      cancelled = true;
    };
  }, [baseDispatch]);

  // 2) dispatch: State sofort ändern + Action für die Datenbank vormerken
  const dispatch = useCallback(
    (action: AppAction) => {
      baseDispatch(action);
      if (supabase) pendingActions.current.push(action);
    },
    [baseDispatch],
  );

  // 3) Nach jeder State-Änderung vorgemerkte Actions in Supabase schreiben
  useEffect(() => {
    const client = supabase;
    if (!client || pendingActions.current.length === 0) return;

    const batch = pendingActions.current.splice(0);
    const snapshot = state;

    writeQueue.current = writeQueue.current.then(async () => {
      setSync((prev) => ({ ...prev, status: "saving" }));
      try {
        for (const action of batch) {
          await syncAction(client, action, snapshot);
        }
        setSync((prev) => ({ ...prev, status: "idle", error: null }));
      } catch (error: unknown) {
        setSync((prev) => ({ ...prev, status: "error", error: errorMessage(error) }));
      }
    });
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, sync }), [state, dispatch, sync]);

  return <DevboardContext.Provider value={value}>{children}</DevboardContext.Provider>;
}
