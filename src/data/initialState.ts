import type { AppState } from "@/types";

/** Leerer Startzustand: keine Boards, kein Team, kein Profil */
export function createInitialState(): AppState {
  return {
    users: [],
    currentUserId: null,
    boards: [],
  };
}
