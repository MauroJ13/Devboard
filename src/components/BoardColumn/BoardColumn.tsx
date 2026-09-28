import { useRef, useState, type DragEvent } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskCard, TASK_DRAG_MIME } from "@/components/TaskCard/TaskCard";
import { DONE_COLUMN_ID } from "@/data/columns";
import { cn } from "@/lib/utils";
import type { Column, ColumnId, Task, User } from "@/types";
import "./BoardColumn.scss";

type BoardColumnProps = {
  column: Column;
  className?: string;
  tasks: Task[];
  getUser: (userId: string | null) => User | undefined;
  onAddTask: (columnId: ColumnId) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onDropTask: (taskId: string, columnId: ColumnId, index: number) => void;
};

export function BoardColumn({
  column,
  className,
  tasks,
  getUser,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDropTask,
}: BoardColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  /** Ermittelt anhand der Mausposition, an welcher Stelle der Task eingefügt wird */
  function getDropIndex(clientY: number): number {
    const cards = listRef.current?.querySelectorAll<HTMLElement>("[data-task-card]") ?? [];
    for (let i = 0; i < cards.length; i += 1) {
      const rect = cards[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return cards.length;
  }

  function isTaskDrag(event: DragEvent<HTMLElement>) {
    return event.dataTransfer.types.includes(TASK_DRAG_MIME);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!isTaskDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const index = getDropIndex(event.clientY);
    if (index !== dropIndex) setDropIndex(index);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setDropIndex(null);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData(TASK_DRAG_MIME);
    const index = dropIndex ?? getDropIndex(event.clientY);
    setDropIndex(null);
    if (taskId) onDropTask(taskId, column.id, index);
  }

  const isDropTarget = dropIndex !== null;
  const isDoneColumn = column.id === DONE_COLUMN_ID;

  return (
    <section
      className={cn(
        "board-column flex min-w-0 flex-col rounded-lg border bg-card",
        isDropTarget && "is-drop-target",
        className,
      )}
      aria-label={`Spalte ${column.title}`}
      data-testid={`column-${column.id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {column.title}
          <span className="text-xs font-normal text-muted-foreground">{tasks.length}</span>
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onAddTask(column.id)}
          aria-label={`Task in „${column.title}“ hinzufügen`}
          title="Task hinzufügen"
        >
          <Plus />
        </Button>
      </header>

      <div ref={listRef} className="board-column__list flex flex-1 flex-col gap-2 p-2">
        {tasks.map((task, index) => (
          <div key={task.id} className="flex flex-col gap-2">
            {dropIndex === index && <div className="board-column__indicator" aria-hidden />}
            <TaskCard
              task={task}
              assignee={getUser(task.assignedUserId)}
              highlightOverdue={!isDoneColumn}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          </div>
        ))}

        {dropIndex === tasks.length && tasks.length > 0 && (
          <div className="board-column__indicator" aria-hidden />
        )}

        {tasks.length === 0 && (
          <p className="board-column__empty flex flex-1 items-center justify-center rounded-md px-2 py-6 text-center text-xs text-muted-foreground">
            Keine Tasks vorhanden
          </p>
        )}
      </div>
    </section>
  );
}
