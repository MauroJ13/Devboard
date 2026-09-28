import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserFormValues } from "@/types";

export type UserFieldErrors = Partial<Record<keyof UserFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validierung für Profil und Team-Mitglieder (E-Mail ist optional) */
export function validateUser(values: UserFormValues): UserFieldErrors {
  const errors: UserFieldErrors = {};
  if (!values.name.trim()) errors.name = "Der Name darf nicht leer sein.";
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Bitte gib eine gültige E-Mail ein.";
  }
  return errors;
}

type UserFieldsProps = {
  idPrefix: string;
  values: UserFormValues;
  errors: UserFieldErrors;
  onChange: (values: UserFormValues) => void;
  autoFocus?: boolean;
};

/** Wiederverwendbare Eingabefelder Name + E-Mail */
export function UserFields({ idPrefix, values, errors, onChange, autoFocus }: UserFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
          placeholder="z. B. Sophie"
          maxLength={40}
          autoFocus={autoFocus}
          aria-invalid={errors.name ? true : undefined}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-email`}>E-Mail</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={values.email}
          onChange={(event) => onChange({ ...values, email: event.target.value })}
          placeholder="name@beispiel.de"
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
    </>
  );
}
