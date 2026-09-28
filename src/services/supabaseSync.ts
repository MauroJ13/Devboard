import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_COLUMNS } from "@/data/columns";
import type { AppAction } from "@/reducers/actions";
import type { AppState, Board, ColumnId, Task, User } from "@/types";

/*
 * Verbindung zwischen zentralem React-State (Reducer) und Supabase.
 *
 * Ablauf:
 *  1. Beim Start lädt loadRemoteState() alle Daten → dispatch(HYDRATE)
 *  2. Jede Action ändert zuerst sofort den lokalen State (optimistisches UI)
 *  3. Danach schreibt syncAction() die Änderung in die Datenbank
 */

/* ---------- Tabellen-Zeilen (entsprechen supabase/schema.sql) ---------- */

type MemberRow = {
  id: string;
  name: string;
  email: string;
};

type BoardRow = {
  id: string;
  title: string;
  created_at: string;
};

type TaskRow = {
  id: string;
  board_id: string;
  title: string;
  description: string;
  assigned_member_id: string | null;
  deadline: string | null;
  column_id: ColumnId;
  position: number;
  created_at: string;
};

/* ---------- Mapping DB ⇄ App ---------- */

function toUser(row: MemberRow): User {
  return { id: row.id, name: row.name, email: row.email };
}

function toMemberRow(user: User): MemberRow {
  return { id: user.id, name: user.name, email: user.email };
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assignedUserId: row.assigned_member_id,
    deadline: row.deadline ?? "",
    columnId: row.column_id,
    createdAt: row.created_at,
  };
}

function toTaskRow(boardId: string, task: Task, position: number): TaskRow {
  return {
    id: task.id,
    board_id: boardId,
    title: task.title,
    description: task.description,
    assigned_member_id: task.assignedUserId,
    deadline: task.deadline || null,
    column_id: task.columnId,
    position,
    created_at: task.createdAt,
  };
}

function toBoardRow(board: Board): BoardRow {
  return { id: board.id, title: board.title, created_at: board.createdAt };
}

/** Supabase liefert Fehler als Rückgabewert – hier in Exceptions umwandeln */
function assertOk(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

/* ---------- Laden ---------- */

export async function loadRemoteState(
  client: SupabaseClient,
): Promise<Pick<AppState, "users" | "boards">> {
  const [members, boards, tasks] = await Promise.all([
    client.from("members").select("id, name, email").order("created_at"),
    client.from("boards").select("id, title, created_at").order("created_at"),
    client
      .from("tasks")
      .select(
        "id, board_id, title, description, assigned_member_id, deadline, column_id, position, created_at",
      )
      .order("position"),
  ]);

  assertOk(members.error, "Team laden");
  assertOk(boards.error, "Boards laden");
  assertOk(tasks.error, "Tasks laden");

  const taskRows = (tasks.data ?? []) as TaskRow[];

  return {
    users: ((members.data ?? []) as MemberRow[]).map(toUser),
    boards: ((boards.data ?? []) as BoardRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      columns: DEFAULT_COLUMNS.map((column) => ({ ...column })),
      tasks: taskRows.filter((task) => task.board_id === row.id).map(toTask),
    })),
  };
}

/* ---------- Schreiben ---------- */

/** Speichert alle Tasks eines Boards inkl. Reihenfolge (position) */
async function upsertBoardTasks(client: SupabaseClient, board: Board): Promise<void> {
  if (board.tasks.length === 0) return;
  const rows = board.tasks.map((task, index) => toTaskRow(board.id, task, index));
  const { error } = await client.from("tasks").upsert(rows);
  assertOk(error, "Tasks speichern");
}

/**
 * Überträgt eine bereits im Reducer angewendete Action in die Datenbank.
 * `state` ist der Zustand NACH der Action.
 */
export async function syncAction(
  client: SupabaseClient,
  action: AppAction,
  state: AppState,
): Promise<void> {
  switch (action.type) {
    case "CREATE_BOARD":
    case "UPDATE_BOARD": {
      const boardId =
        action.type === "CREATE_BOARD" ? action.payload.board.id : action.payload.boardId;
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return;
      const { error } = await client.from("boards").upsert(toBoardRow(board));
      assertOk(error, "Board speichern");
      return;
    }

    case "DELETE_BOARD": {
      // Tasks werden per "on delete cascade" mitgelöscht
      const { error } = await client.from("boards").delete().eq("id", action.payload.boardId);
      assertOk(error, "Board löschen");
      return;
    }

    case "CREATE_TASK":
    case "UPDATE_TASK":
    case "MOVE_TASK": {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      if (board) await upsertBoardTasks(client, board);
      return;
    }

    case "DELETE_TASK": {
      const { error } = await client.from("tasks").delete().eq("id", action.payload.taskId);
      assertOk(error, "Task löschen");
      return;
    }

    case "CREATE_USER":
    case "UPDATE_USER": {
      const userId =
        action.type === "CREATE_USER" ? action.payload.user.id : action.payload.userId;
      const user = state.users.find((u) => u.id === userId);
      if (!user) return;
      const { error } = await client.from("members").upsert(toMemberRow(user));
      assertOk(error, "Team-Mitglied speichern");
      return;
    }

    case "DELETE_USER": {
      // Zuweisungen werden per "on delete set null" entfernt
      const { error } = await client.from("members").delete().eq("id", action.payload.userId);
      assertOk(error, "Team-Mitglied löschen");
      return;
    }

    case "SET_CURRENT_USER":
    case "HYDRATE":
      // Nur lokal: welches Profil "ich" bin, wird pro Browser gespeichert
      return;

    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}
