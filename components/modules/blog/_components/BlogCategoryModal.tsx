"use client";

import { useEffect, useState } from "react";
import { BlogCategory } from "../_types/blog.types";

import { Input } from "@/components/ui";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";

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
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derive formData from category prop, avoid setState in effect
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

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      // Auto-generate slug from name if creating
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
      open={visible}
      onClose={handleClose}
      title={category ? "Edit Category" : "Add Category"}
      className="max-w-md "
    >
      <form onSubmit={handleSubmit} className="space-y-4 ">
        <Input
          label="Category Name"
          placeholder="e.g. Technology"
          value={formData.name}
          onValueChange={handleNameChange}
          error={errors.name}
          requiredSign
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
        />

        <div className="space-y-1.5">
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
            className=" w-full bg-transparent border-border dark:border-[#424242]"
          />
        </div>

        <div className="flex gap-3 mt-5">
          <Button
            onClick={handleClose}
            type="button"
            className="flex-1 h-10"
            variant="outline"
          >
            Cancel
          </Button>

          <Button type="submit" className="flex-1 h-10">
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
