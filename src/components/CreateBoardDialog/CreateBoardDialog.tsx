import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateBoardDialogProps = {
  onCreate: (title: string) => void;
};

export function CreateBoardDialog({ onCreate }: CreateBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTitle("");
      setError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Bitte gib einen Titel ein.");
      return;
    }
    onCreate(trimmed);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Neues Board
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>Neues Board</DialogTitle>
            <DialogDescription>Gib deinem Board einen aussagekräftigen Titel.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="board-title">Titel</Label>
            <Input
              id="board-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (error) setError(null);
              }}
              placeholder="z. B. Sprint 12"
              autoFocus
              aria-invalid={error ? true : undefined}
              maxLength={80}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit">Erstellen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
