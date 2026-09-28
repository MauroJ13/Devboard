import type { AppState, Board, ColumnId, Task } from "@/types";
import type { AppAction } from "@/reducers/actions";

/** Hilfsfunktion: genau ein Board unveränderlich aktualisieren */
function updateBoardById(
  state: AppState,
  boardId: string,
  update: (board: Board) => Board,
): AppState {
  const index = state.boards.findIndex((board) => board.id === boardId);
  if (index === -1) return state;

  const current = state.boards[index];
  const next = update(current);
  // Keine Änderung → gleiche Referenz zurückgeben (kein unnötiges Re-Render/Speichern)
  if (next === current) return state;

  const boards = [...state.boards];
  boards[index] = next;
  return { ...state, boards };
}

/**
 * Fügt einen Task an Position `index` innerhalb seiner Zielspalte ein.
 * Die Tasks eines Boards liegen in einem flachen Array; die Reihenfolge der Tasks
 * einer Spalte ergibt sich aus ihrer Reihenfolge in diesem Array.
 */
function insertIntoColumn(tasks: Task[], task: Task, columnId: ColumnId, index: number): Task[] {
  const columnTasks = tasks.filter((t) => t.columnId === columnId);
  const result = [...tasks];

  if (index >= columnTasks.length) {
    const lastInColumn = columnTasks[columnTasks.length - 1];
    const insertAt = lastInColumn ? result.indexOf(lastInColumn) + 1 : result.length;
    result.splice(insertAt, 0, task);
    return result;
  }

  const anchor = columnTasks[Math.max(0, index)];
  result.splice(result.indexOf(anchor), 0, task);
  return result;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "CREATE_BOARD": {
      return { ...state, boards: [...state.boards, action.payload.board] };
    }

    case "UPDATE_BOARD": {
      const { boardId, changes } = action.payload;
      const title = changes.title?.trim();
      if (changes.title !== undefined && !title) return state;

      return updateBoardById(state, boardId, (board) => ({
        ...board,
        ...changes,
        ...(title !== undefined ? { title } : {}),
      }));
    }

    case "DELETE_BOARD": {
      return {
        ...state,
        boards: state.boards.filter((board) => board.id !== action.payload.boardId),
      };
    }

    case "CREATE_TASK": {
      const { boardId, task } = action.payload;
      return updateBoardById(state, boardId, (board) => ({
        ...board,
        tasks: [...board.tasks, task],
      }));
    }

    case "UPDATE_TASK": {
      const { boardId, taskId, changes } = action.payload;
      return updateBoardById(state, boardId, (board) => {
        const existing = board.tasks.find((task) => task.id === taskId);
        if (!existing) return board;

        const updated: Task = { ...existing, ...changes };

        // Spaltenwechsel über den Dialog → Task ans Ende der neuen Spalte setzen
        if (changes.columnId && changes.columnId !== existing.columnId) {
          const withoutTask = board.tasks.filter((task) => task.id !== taskId);
          return {
            ...board,
            tasks: insertIntoColumn(withoutTask, updated, updated.columnId, Infinity),
          };
        }

        return {
          ...board,
          tasks: board.tasks.map((task) => (task.id === taskId ? updated : task)),
        };
      });
    }

    case "DELETE_TASK": {
      const { boardId, taskId } = action.payload;
      return updateBoardById(state, boardId, (board) => ({
        ...board,
        tasks: board.tasks.filter((task) => task.id !== taskId),
      }));
    }

    case "MOVE_TASK": {
      const { boardId, taskId, toColumnId } = action.payload;
      return updateBoardById(state, boardId, (board) => {
        const task = board.tasks.find((t) => t.id === taskId);
        if (!task) return board;

        let toIndex = action.payload.toIndex;

        // Der Ziel-Index wurde inklusive des gezogenen Tasks berechnet.
        // Wird innerhalb derselben Spalte nach unten verschoben, verschiebt
        // sich der Index nach dem Entfernen um eins.
        if (task.columnId === toColumnId) {
          const currentIndex = board.tasks
            .filter((t) => t.columnId === toColumnId)
            .findIndex((t) => t.id === taskId);
          if (currentIndex < toIndex) toIndex -= 1;
          if (currentIndex === toIndex) return board;
        }

        const withoutTask = board.tasks.filter((t) => t.id !== taskId);
        const moved: Task = { ...task, columnId: toColumnId };

        return {
          ...board,
          tasks: insertIntoColumn(withoutTask, moved, toColumnId, toIndex),
        };
      });
    }

    case "UPDATE_USER": {
      const { userId, changes } = action.payload;
      const name = changes.name?.trim();
      const email = changes.email?.trim();
      if (changes.name !== undefined && !name) return state;

      return {
        ...state,
        users: state.users.map((user) =>
          user.id === userId
            ? {
                ...user,
                ...(name !== undefined ? { name } : {}),
                ...(email !== undefined ? { email } : {}),
              }
            : user,
        ),
      };
    }

    case "CREATE_USER": {
      const { user, setAsCurrent } = action.payload;
      if (!user.name) return state;
      return {
        ...state,
        users: [...state.users, user],
        currentUserId: setAsCurrent ? user.id : state.currentUserId,
      };
    }

    case "DELETE_USER": {
      const { userId } = action.payload;
      return {
        ...state,
        users: state.users.filter((user) => user.id !== userId),
        currentUserId: state.currentUserId === userId ? null : state.currentUserId,
        // Tasks des gelöschten Mitglieds werden "Nicht zugewiesen"
        boards: state.boards.map((board) =>
          board.tasks.some((task) => task.assignedUserId === userId)
            ? {
                ...board,
                tasks: board.tasks.map((task) =>
                  task.assignedUserId === userId ? { ...task, assignedUserId: null } : task,
                ),
              }
            : board,
        ),
      };
    }

    case "SET_CURRENT_USER": {
      const { userId } = action.payload;
      if (userId !== null && !state.users.some((user) => user.id === userId)) return state;
      return { ...state, currentUserId: userId };
    }

    case "HYDRATE": {
      const { users, boards } = action.payload;
      const currentStillExists = users.some((user) => user.id === state.currentUserId);
      return {
        users,
        boards,
        currentUserId: currentStillExists ? state.currentUserId : null,
      };
    }

    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}
