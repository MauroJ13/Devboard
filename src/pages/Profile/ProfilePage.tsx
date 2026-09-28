import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { CalendarDays, CheckCircle2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { TeamSection } from "@/components/TeamSection/TeamSection";
import { UserFields, validateUser, type UserFieldErrors } from "@/components/UserFields/UserFields";
import { DONE_COLUMN_ID } from "@/data/columns";
import { useCurrentUser, useDevboard } from "@/hooks/useDevboard";
import { formatDeadline } from "@/lib/date";
import { actions } from "@/reducers/actions";
import type { User, UserFormValues } from "@/types";

export function ProfilePage() {
  const currentUser = useCurrentUser();

  return (
    <>
      <PageHeader
        title="Profil"
        description={
          currentUser ? "Deine persönlichen Daten, Aufgaben und dein Team." : "Lege dein Profil an."
        }
      />

      <div className="grid gap-6">
        {currentUser ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfileForm key={currentUser.id} user={currentUser} />
            <MyTasks user={currentUser} />
          </div>
        ) : (
          <CreateProfile />
        )}
        <TeamSection />
      </div>
    </>
  );
}

/* ---------- Kein Profil: anlegen oder bestehendes Mitglied wählen ---------- */

function CreateProfile() {
  const { state, dispatch } = useDevboard();
  const [values, setValues] = useState<UserFormValues>({ name: "", email: "" });
  const [errors, setErrors] = useState<UserFieldErrors>({});
  const [existingId, setExistingId] = useState<string>("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateUser(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    dispatch(actions.createUser(values, true));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border p-5">
        <h2 className="mb-1 font-semibold">Profil anlegen</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Du wirst automatisch als Mitglied zum Team hinzugefügt.
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <UserFields
            idPrefix="profile"
            values={values}
            errors={errors}
            onChange={(next) => {
              setValues(next);
              setErrors({});
            }}
          />
          <div>
            <Button type="submit">Profil anlegen</Button>
          </div>
        </form>
      </section>

      {state.users.length > 0 && (
        <section className="rounded-lg border p-5">
          <h2 className="mb-1 font-semibold">Bereits im Team?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Wähle dein bestehendes Team-Mitglied aus.
          </p>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-existing">Ich bin …</Label>
              <Select value={existingId} onValueChange={setExistingId}>
                <SelectTrigger id="profile-existing" aria-label="Team-Mitglied auswählen">
                  <SelectValue placeholder="Mitglied auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {state.users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                variant="outline"
                disabled={!existingId}
                onClick={() => dispatch(actions.setCurrentUser(existingId))}
              >
                Als dieses Mitglied fortfahren
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- Profil bearbeiten ---------- */

function ProfileForm({ user }: { user: User }) {
  const { dispatch } = useDevboard();
  const [values, setValues] = useState<UserFormValues>({ name: user.name, email: user.email });
  const [errors, setErrors] = useState<UserFieldErrors>({});
  const [saved, setSaved] = useState(false);

  const isDirty = values.name.trim() !== user.name || values.email.trim() !== user.email;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateUser(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    dispatch(actions.updateUser(user.id, values));
    setSaved(true);
  }

  return (
    <section className="rounded-lg border p-5">
      <h2 className="mb-4 font-semibold">Persönliche Daten</h2>
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <UserFields
          idPrefix="profile"
          values={values}
          errors={errors}
          onChange={(next) => {
            setValues(next);
            setErrors({});
            setSaved(false);
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!isDirty}>
            Speichern
          </Button>
          {saved && !isDirty && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground" role="status">
              <CheckCircle2 className="size-4 text-primary-hover" aria-hidden />
              Gespeichert
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-muted-foreground"
            onClick={() => dispatch(actions.setCurrentUser(null))}
            title="Anderes Profil wählen oder neues anlegen"
          >
            <LogOut />
            Profil wechseln
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ---------- Eigene Tasks ---------- */

function MyTasks({ user }: { user: User }) {
  const { state } = useDevboard();

  const myTasks = state.boards.flatMap((board) =>
    board.tasks
      .filter((task) => task.assignedUserId === user.id)
      .map((task) => ({ task, board })),
  );
  const openTasks = myTasks.filter(({ task }) => task.columnId !== DONE_COLUMN_ID);

  return (
    <section className="rounded-lg border p-5">
      <h2 className="font-semibold">Meine offenen Tasks</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        {openTasks.length} offen · {myTasks.length - openTasks.length} erledigt ·{" "}
        {state.boards.length} Boards
      </p>

      {openTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine offenen Tasks.</p>
      ) : (
        <ul className="grid gap-2">
          {openTasks.map(({ task, board }) => (
            <li key={task.id}>
              <Link
                to={`/board/${board.id}`}
                className="block rounded-md border px-3 py-2 transition-colors hover:border-foreground hover:bg-muted/50"
              >
                <span className="block truncate text-sm font-medium">{task.title}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  <span>{board.title}</span>
                  {task.deadline && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" aria-hidden />
                      {formatDeadline(task.deadline)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
