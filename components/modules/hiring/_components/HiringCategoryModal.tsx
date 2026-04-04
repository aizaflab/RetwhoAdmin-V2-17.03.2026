"use client";

import { useState } from "react";
import { HiringCategory, CategoryType } from "../_types/hiring.types";
import { Input, Modal } from "@/components/ui";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";

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
    <Modal
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
        <Input
          label="Category Name"
          placeholder="e.g. Software Engineering"
          value={formData.name}
          onValueChange={handleNameChange}
          error={errors.name}
          requiredSign
          className="dark:border-darkBorder"
        />

        <Input
          label="Slug"
          placeholder="e.g. software-engineering"
          value={formData.slug}
          onValueChange={(val) => {
            setFormData((prev) => ({ ...prev, slug: val }));
            if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
          }}
          error={errors.slug}
          requiredSign
          helperText="Auto-generated from name. Edit if needed."
          className="dark:border-darkBorder"
        />

        <Select
          label="Category Type"
          options={[
            { value: "job", label: "Job" },
            { value: "service", label: "Service" },
          ]}
          value={formData.type}
          onValueChange={(val) =>
            setFormData((prev) => ({ ...prev, type: val as CategoryType }))
          }
          className="w-full"
          fieldClass="h-10!"
        />

        <Select
          label="Status"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          value={formData.status}
          onValueChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              status: val as "active" | "inactive",
            }))
          }
          className="w-full"
          fieldClass="h-10!"
        />
      </form>
    </Modal>
  );
}
