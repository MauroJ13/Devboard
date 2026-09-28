import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types";

/** Radix Select erlaubt keinen leeren String als Wert → Platzhalter-Wert */
const UNASSIGNED = "__unassigned__";

type UserSelectProps = {
  id?: string;
  users: User[];
  value: string | null;
  onChange: (userId: string | null) => void;
};

export function UserSelect({ id, users, value, onChange }: UserSelectProps) {
  return (
    <Select
      value={value ?? UNASSIGNED}
      onValueChange={(next) => onChange(next === UNASSIGNED ? null : next)}
    >
      <SelectTrigger id={id} aria-label="Person auswählen">
        <SelectValue placeholder="Person auswählen" />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.name}
          </SelectItem>
        ))}
        {users.length > 0 && <SelectSeparator />}
        <SelectItem value={UNASSIGNED}>Nicht zugewiesen</SelectItem>
      </SelectContent>
    </Select>
  );
}
