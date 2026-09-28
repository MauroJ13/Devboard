import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EditableTitleProps = {
  title: string;
  onSave: (title: string) => void;
};

/** Überschrift mit Edit-Button – wird beim Klick zum Eingabefeld */
export function EditableTitle({ title, onSave }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  function startEditing() {
    setDraft(title);
    setIsEditing(true);
  }

  function cancel() {
    setDraft(title);
    setIsEditing(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (trimmed !== title) onSave(trimmed);
    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Board-Titel"
          className="h-10 max-w-sm text-lg font-bold"
          maxLength={80}
          autoFocus
        />
        <Button type="submit" size="icon" aria-label="Titel speichern" disabled={!draft.trim()}>
          <Check />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={cancel} aria-label="Abbrechen">
          <X />
        </Button>
      </form>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={startEditing}
        aria-label="Board-Titel bearbeiten"
        title="Titel bearbeiten"
      >
        <Pencil className="size-3.5" />
      </Button>
    </div>
  );
}
