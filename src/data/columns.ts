import type { Column } from "@/types";

/** Standard-Spalten, die jedes neue Board erhält */
export const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export const DONE_COLUMN_ID = "done";
