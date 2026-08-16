"use client";

import type React from "react";

import { cn } from "@/lib/utils";

import { Label } from "../label/Label";

/**
 * Composable form-field primitives — control-agnostic, so the same building
 * blocks lay out Checkbox, Radio, Switch, Input, Select, …
 *
 *   <FieldGroup>
 *     <Field orientation="horizontal">
 *       <Checkbox id="x" />
 *       <FieldContent>
 *         <FieldLabel htmlFor="x">Title</FieldLabel>
 *         <FieldDescription>Helper text</FieldDescription>
 *       </FieldContent>
 *     </Field>
 *   </FieldGroup>
 */

/** Vertical stack of fields with consistent spacing. */
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-6", className)}
      {...props}
    />
  );
}

type FieldOrientation = "vertical" | "horizontal" | "responsive";

/**
 * A single field row/column. Establishes the `group/field` scope so labels and
 * descriptions can react to `data-disabled`.
 */
function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & { orientation?: FieldOrientation }) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(
        "group/field flex w-full gap-3",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-1.5",
        "data-[orientation=horizontal]:items-center",
        "data-[orientation=responsive]:flex-col sm:data-[orientation=responsive]:flex-row sm:data-[orientation=responsive]:items-center",
        "has-data-disabled:opacity-100", // keep the box crisp; Label dims itself
        className,
      )}
      {...props}
    />
  );
}

/** Stacks a label + description (and grows to fill a horizontal field). */
function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-1 flex-col gap-1 leading-snug", className)}
      {...props}
    />
  );
}

/** A label tied to a control via `htmlFor`, or wrapping a whole field. */
function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("w-fit cursor-pointer", className)}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={cn(
        "flex items-center gap-2 text-sm leading-snug font-medium select-none",
        "text-gray-700 dark:text-gray-200",
        "group-data-disabled/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** Muted helper text below the label. */
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-xs leading-snug font-normal text-muted-foreground",
        "group-data-disabled/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** Validation message — pair with `aria-invalid` on the control. */
function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-xs font-medium text-red-500", className)}
      {...props}
    />
  );
}

export {
  FieldGroup,
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
};
