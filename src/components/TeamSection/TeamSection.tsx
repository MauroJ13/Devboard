import { useState } from "react";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { MemberFormDialog } from "@/components/MemberFormDialog/MemberFormDialog";
import { useDevboard } from "@/hooks/useDevboard";
import { actions } from "@/reducers/actions";
import type { User } from "@/types";

type DialogState = { mode: "create" } | { mode: "edit"; user: User } | null;

/** Team verwalten: Mitglieder hinzufügen, bearbeiten und entfernen */
export function TeamSection() {
  const { state, dispatch } = useDevboard();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  function countTasks(userId: string): number {
    return state.boards.reduce(
      (sum, board) => sum + board.tasks.filter((task) => task.assignedUserId === userId).length,
      0,
    );
  }

  const deleteTaskCount = userToDelete ? countTasks(userToDelete.id) : 0;

  return (
    <section className="rounded-lg border p-5" aria-labelledby="team-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="team-heading" className="font-semibold">
            Team
          </h2>
          <p className="text-sm text-muted-foreground">
            Diese Personen können Tasks zugewiesen werden.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ mode: "create" })}>
          <UserPlus />
          Mitglied hinzufügen
        </Button>
      </div>

      {state.users.length === 0 ? (
        <div className="flex flex-col items-center rounded-md border border-dashed px-4 py-8 text-center">
          <Users className="mb-2 size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">Noch keine Team-Mitglieder.</p>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="team-list">
          {state.users.map((member) => {
            const count = countTasks(member.id);
            return (
              <li
                key={member.id}
                className="flex items-start gap-2 rounded-md border px-3 py-2 transition-colors hover:border-foreground"
                data-testid="team-member"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {member.name}
                    {member.id === state.currentUserId && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">(du)</span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {member.email || "Keine E-Mail"}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {count} {count === 1 ? "Task" : "Tasks"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setDialog({ mode: "edit", user: member })}
                  aria-label={`${member.name} bearbeiten`}
                  title="Bearbeiten"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setUserToDelete(member)}
                  aria-label={`${member.name} entfernen`}
                  title="Entfernen"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {dialog?.mode === "create" && (
        <MemberFormDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          heading="Mitglied hinzufügen"
          description="Neue Person zum Team hinzufügen."
          submitLabel="Hinzufügen"
          initialValues={{ name: "", email: "" }}
          onSubmit={(values) => {
            dispatch(actions.createUser(values));
            setDialog(null);
          }}
        />
      )}

      {dialog?.mode === "edit" && (
        <MemberFormDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          heading="Mitglied bearbeiten"
          description="Name und E-Mail dieses Team-Mitglieds ändern."
          submitLabel="Speichern"
          initialValues={{ name: dialog.user.name, email: dialog.user.email }}
          onSubmit={(values) => {
            dispatch(actions.updateUser(dialog.user.id, values));
            setDialog(null);
          }}
        />
      )}

      <ConfirmDialog
        open={userToDelete !== null}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Mitglied entfernen?"
        description={
          userToDelete
            ? `„${userToDelete.name}“ wird aus dem Team entfernt.` +
              (deleteTaskCount > 0
                ? ` ${deleteTaskCount} ${deleteTaskCount === 1 ? "Task wird" : "Tasks werden"} danach „Nicht zugewiesen“.`
                : "") +
              (userToDelete.id === state.currentUserId ? " Das ist dein eigenes Profil." : "")
            : ""
        }
        confirmLabel="Entfernen"
        onConfirm={() => {
          if (userToDelete) dispatch(actions.deleteUser(userToDelete.id));
        }}
      />
    </section>
  );
}
