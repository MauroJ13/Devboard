import type { AppState } from "@/types";

export const STORAGE_KEY = "devboard:state:v2";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Grobe Strukturprüfung, damit kaputte localStorage-Daten die App nicht crashen */
function isAppState(value: unknown): value is AppState {
  if (!isObject(value)) return false;
  if (value.currentUserId !== null && typeof value.currentUserId !== "string")
    return false;
  if (!Array.isArray(value.users) || !Array.isArray(value.boards)) return false;

  const usersValid = value.users.every(
    (user) =>
      isObject(user) &&
      typeof user.id === "string" &&
      typeof user.name === "string",
  );
  const boardsValid = value.boards.every(
    (board) =>
      isObject(board) &&
      typeof board.id === "string" &&
      typeof board.title === "string" &&
      Array.isArray(board.columns) &&
      Array.isArray(board.tasks),
  );

  return usersValid && boardsValid;
}

export function loadState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAppState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // z. B. privater Modus oder voller Speicher – die App funktioniert trotzdem weiter
  }
}
