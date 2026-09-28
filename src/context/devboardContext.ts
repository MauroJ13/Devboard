import { createContext, type Dispatch } from "react";

import type { AppState } from "@/types";
import type { AppAction } from "@/reducers/actions";

export type SyncState = {
  /** "supabase" = Daten werden in der Datenbank gespeichert, "local" = nur localStorage */
  mode: "local" | "supabase";
  status: "idle" | "loading" | "saving" | "error";
  error: string | null;
};

export type DevboardContextValue = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  sync: SyncState;
};

export const DevboardContext = createContext<DevboardContextValue | null>(null);
