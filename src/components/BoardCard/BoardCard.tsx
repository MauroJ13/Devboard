import { Link } from "react-router";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DONE_COLUMN_ID } from "@/data/columns";
import type { Board } from "@/types";
import "./BoardCard.scss";

type BoardCardProps = {
  board: Board;
  onDelete: (board: Board) => void;
};

export function BoardCard({ board, onDelete }: BoardCardProps) {
  const taskCount = board.tasks.length;
  const doneCount = board.tasks.filter((task) => task.columnId === DONE_COLUMN_ID).length;

  return (
    <article className="board-card relative rounded-lg border bg-card" data-testid="board-card">
      <Link to={`/board/${board.id}`} className="board-card__link block rounded-lg p-4 pr-12">
        <h2 className="truncate font-semibold">{board.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {board.columns.length} Spalten · {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
          {taskCount > 0 && ` · ${doneCount} erledigt`}
        </p>
      </Link>

      <Button
        variant="ghost"
        size="icon-sm"
        className="board-card__delete absolute top-3 right-3 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(board)}
        aria-label={`Board „${board.title}“ löschen`}
        title="Board löschen"
      >
        <Trash2 />
      </Button>
    </article>
  );
}
