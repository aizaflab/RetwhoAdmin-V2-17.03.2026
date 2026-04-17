"use client";

import { useState } from "react";
import { Eye, EyeOff, LucideLock } from "lucide-react";
import { Input } from "@/components/ui";

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
  return (
    <div className="relative">
      <Input
        label={label}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        startIcon={<LucideLock className="size-4.5" />}
        placeholder={`Enter ${label}`}
        endIcon={
          show ? (
            <EyeOff
              className="w-4 h-4 cursor-pointer"
              onClick={() => setShow(!show)}
            />
          ) : (
            <Eye
              className="w-4 h-4 cursor-pointer"
              onClick={() => setShow(!show)}
            />
          )
        }
        className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
      />
    </div>
  );
}
