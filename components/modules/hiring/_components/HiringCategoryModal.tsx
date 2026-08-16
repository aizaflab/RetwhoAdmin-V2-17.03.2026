"use client";

import { useState } from "react";
import { HiringCategory, CategoryType } from "../_types/hiring.types";
import {
  Dialog,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";

const TYPE_OPTIONS: SelectOption[] = [
  { value: "job", label: "Job" },
  { value: "service", label: "Service" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

interface HiringCategoryModalProps {
  category: HiringCategory | null;
  onClose: () => void;
  onSave: (data: Partial<HiringCategory>) => void;
}

export default function HiringCategoryModal({
  category,
  onClose,
  onSave,
}: HiringCategoryModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    type: (category?.type ?? "job") as CategoryType,
    status: (category?.status ?? "active") as "active" | "inactive",
  });

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !category
        ? val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : prev.slug,
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Category name is required";
    if (!formData.slug.trim()) errs.slug = "Slug is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id: category?.id ?? `hcat_${Date.now()}`,
      name: formData.name,
      slug: formData.slug,
      type: formData.type,
      status: formData.status,
      postCount: category?.postCount ?? 0,
      createdAt: category?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={category ? "Edit Category" : "Add Hiring Category"}
      size="medium"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" form="hiring-cat-form" className="flex-1 h-10">
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      }
    >
      <form id="hiring-cat-form" onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="hiring-category-name">
            Category Name
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="hiring-category-name"
            name="name"
            placeholder="e.g. Software Engineering"
            value={formData.name}
            onValueChange={handleNameChange}
            aria-invalid={errors.name ? true : undefined}
            className="bg-transparent"
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="hiring-category-slug">
            Slug
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="hiring-category-slug"
            name="slug"
            placeholder="e.g. software-engineering"
            value={formData.slug}
            onValueChange={(val) => {
              setFormData((prev) => ({ ...prev, slug: val }));
              if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
            }}
            aria-invalid={errors.slug ? true : undefined}
            className="bg-transparent"
          />
          {errors.slug ? (
            <FieldError>{errors.slug}</FieldError>
          ) : (
            <FieldDescription>
              Auto-generated from the name. Edit if needed.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel
            id="hiring-category-type-label"
            htmlFor="hiring-category-type"
          >
            Category Type
          </FieldLabel>
          <Select
            id="hiring-category-type"
            value={formData.type}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, type: val as CategoryType }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" options={TYPE_OPTIONS} />
            </SelectTrigger>
            <SelectContent>
              <SelectItems options={TYPE_OPTIONS} />
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            id="hiring-category-status-label"
            htmlFor="hiring-category-status"
          >
            Status
          </FieldLabel>
          <Select
            id="hiring-category-status"
            value={formData.status}
            onValueChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                status: val as "active" | "inactive",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder="Select status"
                options={STATUS_OPTIONS}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItems options={STATUS_OPTIONS} />
            </SelectContent>
          </Select>
        </Field>
      </form>
    </Dialog>
  );
}
