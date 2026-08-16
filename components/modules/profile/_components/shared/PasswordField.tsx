"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, LucideLock } from "lucide-react";
import { Field, FieldLabel, Input } from "@/components/ui";

export function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const id = useId();

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        startIcon={<LucideLock className="size-4.5" />}
        placeholder={`Enter ${label}`}
        endIcon={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="cursor-pointer text-foreground transition-colors hover:text-primary"
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        className="h-10 bg-transparent"
      />
    </Field>
  );
}
