import { useCallback, useContext, useMemo } from "react";

import { DevboardContext } from "@/context/devboardContext";
import type { User } from "@/types";

/** Zugriff auf den zentralen State + dispatch */
export function useDevboard() {
  const context = useContext(DevboardContext);
  if (!context) {
    throw new Error("useDevboard muss innerhalb von <DevboardProvider> verwendet werden.");
  }
  return context;
}

/** Das eigene Profil – undefined, solange noch keins angelegt/gewählt wurde */
export function useCurrentUser(): User | undefined {
  const { state } = useDevboard();
  return state.users.find((user) => user.id === state.currentUserId);
}

export function useBoard(boardId: string | undefined) {
  const { state } = useDevboard();
  return useMemo(
    () => (boardId ? state.boards.find((board) => board.id === boardId) : undefined),
    [state.boards, boardId],
  );
}

/** Liefert alle Team-Mitglieder und eine Lookup-Funktion id → User */
export function useUsers() {
  const { state } = useDevboard();

  const usersById = useMemo(
    () => new Map(state.users.map((user) => [user.id, user] as const)),
    [state.users],
  );

  const getUser = useCallback(
    (userId: string | null) => (userId ? usersById.get(userId) : undefined),
    [usersById],
  );

  return { users: state.users, getUser };
}
