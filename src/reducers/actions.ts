import type {
  AppState,
  Board,
  ColumnId,
  Task,
  TaskFormValues,
  User,
  UserFormValues,
} from "@/types";
import { DEFAULT_COLUMNS } from "@/data/columns";
import { createId } from "@/lib/id";

/**
 * Alle Actions, die der zentrale Reducer versteht.
 * IDs und Zeitstempel werden in den Action-Creators erzeugt,
 * damit der Reducer selbst eine reine Funktion bleibt.
 */
export type AppAction =
  | { type: "CREATE_BOARD"; payload: { board: Board } }
  | { type: "UPDATE_BOARD"; payload: { boardId: string; changes: Partial<Pick<Board, "title">> } }
  | { type: "DELETE_BOARD"; payload: { boardId: string } }
  | { type: "CREATE_TASK"; payload: { boardId: string; task: Task } }
  | {
      type: "UPDATE_TASK";
      payload: { boardId: string; taskId: string; changes: Partial<TaskFormValues> };
    }
  | { type: "DELETE_TASK"; payload: { boardId: string; taskId: string } }
  | {
      type: "MOVE_TASK";
      payload: { boardId: string; taskId: string; toColumnId: ColumnId; toIndex: number };
    }
  | { type: "CREATE_USER"; payload: { user: User; setAsCurrent: boolean } }
  | { type: "UPDATE_USER"; payload: { userId: string; changes: Partial<UserFormValues> } }
  | { type: "DELETE_USER"; payload: { userId: string } }
  | { type: "SET_CURRENT_USER"; payload: { userId: string | null } }
  | { type: "HYDRATE"; payload: Pick<AppState, "users" | "boards"> };

export const actions = {
  createBoard(title: string): AppAction {
    return {
      type: "CREATE_BOARD",
      payload: {
        board: {
          id: createId(),
          title: title.trim(),
          createdAt: new Date().toISOString(),
          columns: DEFAULT_COLUMNS.map((column) => ({ ...column })),
          tasks: [],
        },
      },
    };
  },

  updateBoard(boardId: string, changes: Partial<Pick<Board, "title">>): AppAction {
    return { type: "UPDATE_BOARD", payload: { boardId, changes } };
  },

  deleteBoard(boardId: string): AppAction {
    return { type: "DELETE_BOARD", payload: { boardId } };
  },

  createTask(boardId: string, values: TaskFormValues): AppAction {
    return {
      type: "CREATE_TASK",
      payload: {
        boardId,
        task: {
          id: createId(),
          ...values,
          title: values.title.trim(),
          description: values.description.trim(),
          createdAt: new Date().toISOString(),
        },
      },
    };
  },

  updateTask(boardId: string, taskId: string, changes: Partial<TaskFormValues>): AppAction {
    return { type: "UPDATE_TASK", payload: { boardId, taskId, changes } };
  },

  deleteTask(boardId: string, taskId: string): AppAction {
    return { type: "DELETE_TASK", payload: { boardId, taskId } };
  },

  moveTask(boardId: string, taskId: string, toColumnId: ColumnId, toIndex: number): AppAction {
    return { type: "MOVE_TASK", payload: { boardId, taskId, toColumnId, toIndex } };
  },

  /** Neues Team-Mitglied; mit setAsCurrent = true wird es gleichzeitig zum eigenen Profil */
  createUser(values: UserFormValues, setAsCurrent = false): AppAction {
    return {
      type: "CREATE_USER",
      payload: {
        user: { id: createId(), name: values.name.trim(), email: values.email.trim() },
        setAsCurrent,
      },
    };
  },

  updateUser(userId: string, changes: Partial<UserFormValues>): AppAction {
    return { type: "UPDATE_USER", payload: { userId, changes } };
  },

  deleteUser(userId: string): AppAction {
    return { type: "DELETE_USER", payload: { userId } };
  },

  setCurrentUser(userId: string | null): AppAction {
    return { type: "SET_CURRENT_USER", payload: { userId } };
  },

  /** Ersetzt Team und Boards durch Daten aus der Datenbank (Supabase) */
  hydrate(data: Pick<AppState, "users" | "boards">): AppAction {
    return { type: "HYDRATE", payload: data };
  },
};
