import { TaskFormDialog } from "@/components/TaskFormDialog/TaskFormDialog";
import type { Column, ColumnId, TaskFormValues, User } from "@/types";

type CreateTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: ColumnId;
  users: User[];
  columns: Column[];
  onCreate: (values: TaskFormValues) => void;
};

export function CreateTaskDialog({
  open,
  onOpenChange,
  columnId,
  users,
  columns,
  onCreate,
}: CreateTaskDialogProps) {
  const columnTitle = columns.find((column) => column.id === columnId)?.title ?? "";

  return (
    <TaskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      heading="Neuer Task"
      description={`Erstelle eine neue Aufgabe in „${columnTitle}“.`}
      submitLabel="Erstellen"
      initialValues={{
        title: "",
        description: "",
        // Standard: niemand zugewiesen – die Person wird bewusst ausgewählt
        assignedUserId: null,
        deadline: "",
        columnId,
      }}
      users={users}
      columns={columns}
      onSubmit={onCreate}
    />
  );
}
