import { useState, type FormEvent } from "react";

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
import { UserFields, validateUser, type UserFieldErrors } from "@/components/UserFields/UserFields";
import type { UserFormValues } from "@/types";

type MemberFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading: string;
  description: string;
  submitLabel: string;
  initialValues: UserFormValues;
  onSubmit: (values: UserFormValues) => void;
};

/** Dialog zum Anlegen und Bearbeiten von Team-Mitgliedern */
export function MemberFormDialog({ open, onOpenChange, ...formProps }: MemberFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <MemberForm {...formProps} />
      </DialogContent>
    </Dialog>
  );
}

function MemberForm({
  heading,
  description,
  submitLabel,
  initialValues,
  onSubmit,
}: Omit<MemberFormDialogProps, "open" | "onOpenChange">) {
  const [values, setValues] = useState<UserFormValues>(initialValues);
  const [errors, setErrors] = useState<UserFieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateUser(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({ name: values.name.trim(), email: values.email.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>{heading}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <UserFields
        idPrefix="member"
        values={values}
        errors={errors}
        autoFocus
        onChange={(next) => {
          setValues(next);
          setErrors({});
        }}
      />

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
