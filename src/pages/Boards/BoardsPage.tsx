import { useState } from "react";
import { LayoutGrid } from "lucide-react";

import { BoardCard } from "@/components/BoardCard/BoardCard";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { CreateBoardDialog } from "@/components/CreateBoardDialog/CreateBoardDialog";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { useDevboard } from "@/hooks/useDevboard";
import { actions } from "@/reducers/actions";
import type { Board } from "@/types";

export function BoardsPage() {
  const { state, dispatch } = useDevboard();
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  return (
    <>
      <PageHeader
        title="Meine Boards"
        actions={<CreateBoardDialog onCreate={(title) => dispatch(actions.createBoard(title))} />}
      />

      {state.boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center">
          <LayoutGrid className="mb-3 size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">Noch keine Boards vorhanden</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lege über „Neues Board“ dein erstes Board an.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.boards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={setBoardToDelete} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={boardToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setBoardToDelete(null);
        }}
        title="Board löschen?"
        description={
          boardToDelete
            ? `„${boardToDelete.title}“ und alle ${boardToDelete.tasks.length} Tasks werden dauerhaft gelöscht.`
            : ""
        }
        onConfirm={() => {
          if (boardToDelete) dispatch(actions.deleteBoard(boardToDelete.id));
        }}
      />
    </>
  );
}
