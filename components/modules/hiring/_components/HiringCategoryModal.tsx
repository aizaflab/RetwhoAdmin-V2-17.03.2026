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
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

import { CATEGORY_STATUS_OPTIONS } from "../_data/hiring-options";
import type {
  HiringCategory,
  HiringCategoryPayload,
  HiringCategoryStatus,
} from "../_types/hiring.types";

interface HiringCategoryModalProps {
  /** Present in edit mode; null to create a new category. */
  category: HiringCategory | null;
  onClose: () => void;
  /** Must reject on failure — the rejection is what puts a 409 on the field. */
  onSave: (payload: HiringCategoryPayload, id?: string) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
}

export default function HiringCategoryModal({
  category,
  onClose,
  onSave,
  saving = false,
}: HiringCategoryModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // The API derives `slug` from the title and its strict schema rejects the
  // field, so the form no longer collects one.
  const [formData, setFormData] = useState({
    title: category?.title ?? "",
    status: (category?.status ?? "active") as HiringCategoryStatus,
  });

  const [prevCategory, setPrevCategory] = useState(category);

  // Adjust state during render when the category prop changes.
  if (category !== prevCategory) {
    setPrevCategory(category);
    setFormData({
      title: category?.title ?? "",
      status: (category?.status ?? "active") as HiringCategoryStatus,
    });
    setErrors({});
  }

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.title.trim()) next.title = "Category name is required";
    else if (formData.title.trim().length < 2)
      next.title = "Name must be at least 2 characters";
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
      await onSave({ title, status: formData.status }, category?._id);
      toast.success(
        category
          ? `Category "${title}" updated successfully`
          : `Category "${title}" created successfully`,
      );
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        category
          ? "Could not update the category. Please try again."
          : "Could not create the category. Please try again.",
      );

      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, title: message }));
      }

      toast.error(message);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={category ? "Edit Category" : "Add Category"}
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
            form="hiring-category-form"
            className="flex-1 h-10"
            loading={saving}
            loadingText="Saving..."
          >
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      }
    >
      <form
        id="hiring-category-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Field>
          <FieldLabel htmlFor="hiring-category-title">
            Category Name
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="hiring-category-title"
            name="title"
            placeholder="e.g. Warehouse & Logistics"
            value={formData.title}
            onValueChange={(val) => {
              setFormData((prev) => ({ ...prev, title: val }));
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            aria-invalid={errors.title ? true : undefined}
            className="bg-transparent"
          />
          {errors.title ? (
            <FieldError>{errors.title}</FieldError>
          ) : (
            <p className="text-xs text-muted-foreground">
              The URL slug is generated from this name.
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel
            id="hiring-category-status-label"
            htmlFor="hiring-category-status"
          >
            Status
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Select
            id="hiring-category-status"
            value={formData.status}
            onValueChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                status: val as HiringCategoryStatus,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder="Select status"
                options={CATEGORY_STATUS_OPTIONS}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItems options={CATEGORY_STATUS_OPTIONS} />
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only active categories can be assigned to a posting.
          </p>
        </Field>
      </form>
    </Dialog>
  );
}
