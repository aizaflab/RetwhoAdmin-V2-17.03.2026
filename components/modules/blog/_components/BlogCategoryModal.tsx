"use client";

import { useState } from "react";
import { BlogCategory } from "../_types/blog.types";
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

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

interface BlogCategoryModalProps {
  category: BlogCategory | null;
  onClose: () => void;
  onSave: (data: Partial<BlogCategory>) => void;
}

export default function BlogCategoryModal({
  category,
  onClose,
  onSave,
}: BlogCategoryModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialFormData = category
    ? {
        name: category.name,
        slug: category.slug,
        status: category.status,
      }
    : {
        name: "",
        slug: "",
        status: "active" as "active" | "inactive",
      };
  const [formData, setFormData] = useState(initialFormData);
  const [prevCategory, setPrevCategory] = useState(category);

  // Adjust state during render when category prop changes
  if (category !== prevCategory) {
    setPrevCategory(category);
    setFormData(
      category
        ? {
            name: category.name,
            slug: category.slug,
            status: category.status,
          }
        : {
            name: "",
            slug: "",
            status: "active",
          },
    );
  }

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
    const newErrs: Record<string, string> = {};
    if (!formData.name.trim()) newErrs.name = "Category name is required";
    if (!formData.slug.trim()) newErrs.slug = "Slug is required";
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: category ? category.id : `cat_${Date.now()}`,
      name: formData.name,
      slug: formData.slug,
      status: formData.status,
      postCount: category ? category.postCount : 0,
      createdAt: category ? category.createdAt : new Date().toISOString(),
    });
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
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="blog-category-form"
            className="flex-1 h-10"
          >
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      }
    >
      <form
        id="blog-category-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Field>
          <FieldLabel htmlFor="category-name">
            Category Name
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="category-name"
            name="name"
            placeholder="e.g. Technology"
            value={formData.name}
            onValueChange={handleNameChange}
            aria-invalid={errors.name ? true : undefined}
            className="bg-transparent"
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="category-slug">
            Slug
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="category-slug"
            name="slug"
            placeholder="e.g. technology"
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
              URL-friendly string. Auto-generated from the name while typing.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel id="category-status-label" htmlFor="category-status">
            Status
          </FieldLabel>
          <Select
            id="category-status"
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
