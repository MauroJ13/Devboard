import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BoardColumn } from "@/components/BoardColumn/BoardColumn";
import { CreateTaskDialog } from "@/components/CreateTaskDialog/CreateTaskDialog";
import { EditTaskDialog } from "@/components/EditTaskDialog/EditTaskDialog";
import { EditableTitle } from "@/components/EditableTitle/EditableTitle";
import { useBoard, useDevboard, useUsers } from "@/hooks/useDevboard";
import { actions } from "@/reducers/actions";
import type { ColumnId, Task } from "@/types";

/** Welcher Task-Dialog gerade offen ist */
type TaskDialogState =
  | { mode: "create"; columnId: ColumnId }
  | { mode: "edit"; taskId: string }
  | null;

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const board = useBoard(boardId);
  const { dispatch } = useDevboard();
  const { users, getUser } = useUsers();
  const [taskDialog, setTaskDialog] = useState<TaskDialogState>(null);

  const tasksByColumn = useMemo(() => {
    const map = new Map<ColumnId, Task[]>();
    board?.columns.forEach((column) => map.set(column.id, []));
    board?.tasks.forEach((task) => map.get(task.columnId)?.push(task));
    return map;
  }, [board]);

  if (!board) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-xl font-bold">Board nicht gefunden</h1>
        <p className="text-sm text-muted-foreground">
          Das Board existiert nicht (mehr) oder der Link ist fehlerhaft.
        </p>
        <Button asChild>
          <Link to="/boards">Zur Übersicht</Link>
        </Button>
      </div>
    );
  }

  const currentBoard = board;
  const editingTask =
    taskDialog?.mode === "edit"
      ? currentBoard.tasks.find((task) => task.id === taskDialog.taskId)
      : undefined;

  function closeDialog(open: boolean) {
    if (!open) setTaskDialog(null);
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/boards" aria-label="Zurück zur Boards-Übersicht" title="Zurück">
            <ArrowLeft />
          </Link>
        </Button>
        <EditableTitle
          key={currentBoard.id}
          title={currentBoard.title}
          onSave={(title) => dispatch(actions.updateBoard(currentBoard.id, { title }))}
        />
      </div>

      {/* Mobile: untereinander · Tablet: horizontal scrollbar · Desktop: 3-spaltiges Grid */}
      <div className="flex flex-col gap-4 sm:snap-x sm:snap-mandatory sm:flex-row sm:overflow-x-auto sm:pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {currentBoard.columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            className="sm:w-72 sm:shrink-0 sm:snap-start md:w-auto"
            tasks={tasksByColumn.get(column.id) ?? []}
            getUser={getUser}
            onAddTask={(columnId) => setTaskDialog({ mode: "create", columnId })}
            onEditTask={(task) => setTaskDialog({ mode: "edit", taskId: task.id })}
            onDeleteTask={(task) => dispatch(actions.deleteTask(currentBoard.id, task.id))}
            onDropTask={(taskId, columnId, index) =>
              dispatch(actions.moveTask(currentBoard.id, taskId, columnId, index))
            }
          />
        ))}
      </div>

      <p className="mt-4 hidden text-xs text-muted-foreground md:block">
        Tipp: Tasks per Drag &amp; Drop zwischen den Spalten verschieben.
      </p>
      <p className="mt-4 text-xs text-muted-foreground md:hidden">
        Tipp: Tippe auf einen Task, um ihn zu bearbeiten oder die Spalte zu wechseln.
      </p>

      {taskDialog?.mode === "create" && (
        <CreateTaskDialog
          open
          onOpenChange={closeDialog}
          columnId={taskDialog.columnId}
          users={users}
          columns={currentBoard.columns}
          onCreate={(values) => {
            dispatch(actions.createTask(currentBoard.id, values));
            setTaskDialog(null);
          }}
        />
      )}

      {editingTask && (
        <EditTaskDialog
          open
          onOpenChange={closeDialog}
          task={editingTask}
          users={users}
          columns={currentBoard.columns}
          onSave={(values) => {
            dispatch(actions.updateTask(currentBoard.id, editingTask.id, values));
            setTaskDialog(null);
          }}
        />
      )}
    </>
  );
}
