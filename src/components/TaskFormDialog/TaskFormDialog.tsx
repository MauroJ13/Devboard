import { useState, type FormEvent } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect } from "@/components/UserSelect/UserSelect";
import type { Column, ColumnId, TaskFormValues, User } from "@/types";

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading: string;
  description: string;
  submitLabel: string;
  initialValues: TaskFormValues;
  users: User[];
  columns: Column[];
  onSubmit: (values: TaskFormValues) => void;
};

/**
 * Gemeinsamer Dialog für "Task erstellen" und "Task bearbeiten".
 * Das Formular liegt in einer eigenen Komponente innerhalb von DialogContent:
 * Radix unmountet den Inhalt beim Schließen, dadurch startet jedes Öffnen
 * automatisch mit frischen initialValues.
 */
export function TaskFormDialog({ open, onOpenChange, ...formProps }: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <TaskForm {...formProps} />
      </DialogContent>
    </Dialog>
  );
}

type TaskFormProps = Omit<TaskFormDialogProps, "open" | "onOpenChange">;

function TaskForm({
  heading,
  description,
  submitLabel,
  initialValues,
  users,
  columns,
  onSubmit,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [titleError, setTitleError] = useState<string | null>(null);

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.title.trim()) {
      setTitleError("Bitte gib einen Titel ein.");
      return;
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>{heading}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="task-title">Titel</Label>
        <Input
          id="task-title"
          value={values.title}
          onChange={(event) => {
            update("title", event.target.value);
            if (titleError) setTitleError(null);
          }}
          onFocus={(event) => event.currentTarget.select()}
          placeholder="z. B. Website erstellen"
          autoFocus
          maxLength={120}
          aria-invalid={titleError ? true : undefined}
        />
        {titleError && <p className="text-xs text-destructive">{titleError}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="task-description">Beschreibung</Label>
        <Textarea
          id="task-description"
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Was soll erledigt werden?"
          className="min-h-32 resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="task-assignee">Zugewiesen an</Label>
          <UserSelect
            id="task-assignee"
            users={users}
            value={values.assignedUserId}
            onChange={(userId) => update("assignedUserId", userId)}
          />
          {users.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Noch kein Team –{" "}
              <Link to="/profile" className="underline underline-offset-2 hover:text-foreground">
                Mitglieder im Profil anlegen
              </Link>
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="task-column">Spalte</Label>
          <Select
            value={values.columnId}
            onValueChange={(next) => update("columnId", next as ColumnId)}
          >
            <SelectTrigger id="task-column" aria-label="Spalte auswählen">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="task-deadline">Deadline</Label>
        <Input
          id="task-deadline"
          type="date"
          value={values.deadline}
          onChange={(event) => update("deadline", event.target.value)}
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Abbrechen
          </Button>
        </DialogClose>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );
}
