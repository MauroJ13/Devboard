import { useState, type DragEvent, type KeyboardEvent } from "react";
import { CalendarDays, Pencil, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDeadline, isOverdue } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Task, User } from "@/types";
import "./TaskCard.scss";

export const TASK_DRAG_MIME = "application/x-devboard-task";

type TaskCardProps = {
  task: Task;
  assignee: User | undefined;
  /** Überfällige Deadlines nur hervorheben, wenn der Task noch nicht erledigt ist */
  highlightOverdue: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskCard({ task, assignee, highlightOverdue, onEdit, onDelete }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const overdue = highlightOverdue && isOverdue(task.deadline);

  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(TASK_DRAG_MIME, task.id);
    // text/plain wird von Firefox benötigt, damit der Drag überhaupt startet
    event.dataTransfer.setData("text/plain", task.id);
    setIsDragging(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onEdit(task);
    }
  }

  return (
    <article
      className={cn("task-card rounded-md border bg-card p-3", isDragging && "is-dragging")}
      data-task-card
      data-testid="task-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onEdit(task)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Task „${task.title}“ bearbeiten`}
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 text-sm font-semibold break-words">{task.title}</h3>

        <div className="task-card__actions -mt-1 -mr-1 flex shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            aria-label="Task bearbeiten"
            title="Bearbeiten"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task);
            }}
            aria-label="Task löschen"
            title="Löschen"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs break-words text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1" data-testid="task-assignee">
          <UserRound className="size-3" aria-hidden />
          {assignee?.name ?? "Nicht zugewiesen"}
        </span>

        {task.deadline && (
          <span
            className={cn("task-card__deadline flex items-center gap-1", overdue && "is-overdue")}
            title={overdue ? "Deadline überschritten" : "Deadline"}
          >
            <CalendarDays className="size-3" aria-hidden />
            {formatDeadline(task.deadline)}
          </span>
        )}
      </div>
    </article>
  );
}
