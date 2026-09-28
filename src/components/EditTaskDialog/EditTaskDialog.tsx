import { TaskFormDialog } from "@/components/TaskFormDialog/TaskFormDialog";
import type { Column, Task, TaskFormValues, User } from "@/types";

type EditTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  users: User[];
  columns: Column[];
  onSave: (values: TaskFormValues) => void;
};

export function EditTaskDialog({
  open,
  onOpenChange,
  task,
  users,
  columns,
  onSave,
}: EditTaskDialogProps) {
  return (
    <TaskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      heading="Task bearbeiten"
      description="Ändere die Details dieser Aufgabe."
      submitLabel="Speichern"
      initialValues={{
        title: task.title,
        description: task.description,
        assignedUserId: task.assignedUserId,
        deadline: task.deadline,
        columnId: task.columnId,
      }}
      users={users}
      columns={columns}
      onSubmit={onSave}
    />
  );
}
