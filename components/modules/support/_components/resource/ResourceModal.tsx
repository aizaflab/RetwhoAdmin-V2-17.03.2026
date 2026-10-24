"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, Field, FieldError, FieldLabel, Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

import { SUPPORT_STATUS_OPTIONS } from "../../_data/support-options";
import type {
  SupportResourceItem,
  SupportResourcePayload,
  SupportStatus,
} from "../../_types/support.types";

interface ResourceModalProps {
  /** Present in edit mode; null to create a new resource. */
  resource: SupportResourceItem | null;
  onClose: () => void;
  /** Must reject on failure — the rejection is what puts a 409 on the field. */
  onSave: (payload: SupportResourcePayload, id?: string) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
}

/** The API's own minimums — checked here to save the round trip. */
const MIN_TITLE = 2;
const MIN_DESCRIPTION = 10;

export default function ResourceModal({
  resource,
  onClose,
  onSave,
  saving = false,
}: ResourceModalProps) {
  // The API derives `slug` from the title and its strict schema rejects the
  // field, so the form does not collect one.
  const [formData, setFormData] = useState({
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    status: (resource?.status ?? "draft") as SupportStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title) next.title = "Title is required";
    else if (title.length < MIN_TITLE)
      next.title = `Title must be at least ${MIN_TITLE} characters`;

    if (!description) next.description = "Description is required";
    else if (description.length < MIN_DESCRIPTION)
      next.description = `Description must be at least ${MIN_DESCRIPTION} characters`;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in the highlighted fields.");
      return;
    }

    const title = formData.title.trim();

    try {
      await onSave(
        {
          title,
          description: formData.description.trim(),
          status: formData.status,
        },
        resource?._id,
      );
      toast.success(
        resource
          ? `Resource "${title}" updated successfully`
          : `Resource "${title}" created successfully`,
      );
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        resource
          ? "Could not update the resource. Please try again."
          : "Could not create the resource. Please try again.",
      );

      // 409 here is the duplicate-title conflict, which belongs on the field
      // the author has to change.
      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, title: message }));
      }

      toast.error(message);
    }
  };

  const descriptionLength = formData.description.trim().length;

  return (
    <Dialog
      open
      onClose={onClose}
      title={resource ? "Edit Resource" : "Add Resource"}
      size="medium"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="resource-form"
            className="flex-1 h-10"
            loading={saving}
            loadingText="Saving..."
          >
            {resource ? "Save Changes" : "Create Resource"}
          </Button>
        </div>
      }
    >
      <form
        id="resource-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Field>
          <FieldLabel htmlFor="resource-title">
            Title
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="resource-title"
            name="title"
            placeholder="e.g. Getting Started"
            value={formData.title}
            onValueChange={(val) => set("title", val)}
            aria-invalid={errors.title ? true : undefined}
            className="bg-transparent"
          />
          {errors.title ? (
            <FieldError>{errors.title}</FieldError>
          ) : (
            <p className="text-xs text-muted-foreground">
              The URL slug is generated from this title.
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="resource-description">
            Description
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Textarea
            id="resource-description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What does this resource cover?"
            invalid={!!errors.description}
            className="bg-transparent"
          />
          {errors.description ? (
            <FieldError>{errors.description}</FieldError>
          ) : (
            <p className="text-xs text-muted-foreground">
              {descriptionLength < MIN_DESCRIPTION
                ? `At least ${MIN_DESCRIPTION} characters (${descriptionLength}/${MIN_DESCRIPTION}).`
                : `${descriptionLength} characters`}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel id="resource-status-label" htmlFor="resource-status">
            Status
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Select
            id="resource-status"
            value={formData.status}
            onValueChange={(val) => set("status", val)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder="Select status"
                options={SUPPORT_STATUS_OPTIONS}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItems options={SUPPORT_STATUS_OPTIONS} />
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only published resources can be picked for articles, chatbot answers
            and videos.
          </p>
        </Field>
      </form>
    </Dialog>
  );
}
