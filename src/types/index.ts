export type User = {
  id: string;
  name: string;
  email: string;
};

export type ColumnId = "todo" | "in-progress" | "done";

export type Column = {
  id: ColumnId;
  title: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  /** Referenz auf User.id – kein duplizierter Name. null = nicht zugewiesen */
  assignedUserId: string | null;
  /** ISO-Datum "YYYY-MM-DD" oder leerer String */
  deadline: string;
  columnId: ColumnId;
  createdAt: string;
};

export type Board = {
  id: string;
  title: string;
  columns: Column[];
  /** Reihenfolge im Array = Reihenfolge innerhalb der jeweiligen Spalte */
  tasks: Task[];
  createdAt: string;
};

export type AppState = {
  /** Team-Mitglieder */
  users: User[];
  /** Das eigene Profil (Team-Mitglied). null = noch kein Profil angelegt/gewählt */
  currentUserId: string | null;
  boards: Board[];
};

/** Werte, die im Mitglieder-/Profil-Formular bearbeitet werden */
export type UserFormValues = Pick<User, "name" | "email">;

/** Werte, die im Task-Formular (Erstellen/Bearbeiten) bearbeitet werden */
export type TaskFormValues = Pick<
  Task,
  "title" | "description" | "assignedUserId" | "deadline" | "columnId"
>;
