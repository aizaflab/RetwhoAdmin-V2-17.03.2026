"use client";

import { useState } from "react";
import { BlogCategory } from "../_types/blog.types";
import { Input, Modal } from "@/components/ui";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";

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
    <Modal
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
          <Button type="submit" className="flex-1 h-10">
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
        <Input
          label="Category Name"
          placeholder="e.g. Technology"
          value={formData.name}
          onValueChange={handleNameChange}
          error={errors.name}
          requiredSign
          className="dark:border-darkBorder dark:focus:border-primary"
        />

        <Input
          label="Slug"
          placeholder="e.g. technology"
          value={formData.slug}
          onValueChange={(val) => {
            setFormData((prev) => ({ ...prev, slug: val }));
            if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
          }}
          error={errors.slug}
          requiredSign
          helperText="URL-friendly string. Will auto-generate if left empty during typing."
          className="dark:border-darkBorder dark:focus:border-primary"
        />

        <Select
          label="Status"
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          value={formData.status}
          onValueChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              status: val as "active" | "inactive",
            }))
          }
          className="w-full dark:border-darkBorder dark:focus:border-primary"
        />
      </form>
    </Modal>
  );
}
