"use client";

import { useState } from "react";
import { SupportResource } from "../../_types/support.types";
import { Input, Modal } from "@/components/ui";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { Textarea } from "@/components/ui/textarea/Textarea";

interface ResourceModalProps {
  resource: SupportResource | null;
  onClose: () => void;
  onSave: (data: Partial<SupportResource>) => void;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function toSlug(val: string) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function ResourceModal({
  resource,
  onClose,
  onSave,
}: ResourceModalProps) {
  const blank = {
    name: "",
    slug: "",
    description: "",
    icon: "🚀",
    status: "active" as const,
  };

  const [formData, setFormData] = useState(
    resource
      ? {
          name: resource.name,
          slug: resource.slug,
          description: resource.description,
          status: resource.status,
        }
      : blank,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !resource ? toSlug(val) : prev.slug,
    }));
    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.slug.trim()) e.slug = "Slug is required";
    if (!formData.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      id: resource?.id ?? `res_${Date.now()}`,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      status: formData.status,
      articleCount: resource?.articleCount ?? 0,
      createdAt: resource?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <Modal
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
          >
            Cancel
          </Button>
          <Button type="submit" form="resource-form" className="flex-1 h-10">
            {resource ? "Save Changes" : "Create Resource"}
          </Button>
        </div>
      }
    >
      <form id="resource-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="Resource Name"
          placeholder="e.g. Getting Started"
          value={formData.name}
          onValueChange={handleNameChange}
          error={errors.name}
          requiredSign
          className="dark:border-darkBorder dark:focus:border-primary"
        />

        {/* Slug */}
        <Input
          label="Slug"
          placeholder="e.g. getting-started"
          value={formData.slug}
          onValueChange={(val) => {
            setFormData((p) => ({ ...p, slug: val }));
            if (errors.slug) setErrors((p) => ({ ...p, slug: "" }));
          }}
          error={errors.slug}
          requiredSign
          helperText="URL-friendly identifier. Auto-generated from name."
          className="dark:border-darkBorder dark:focus:border-primary"
        />

        {/* Description */}
        <div className="space-y-1.5">
          <Textarea
            rows={3}
            label="Description"
            required
            requiredSign
            value={formData.description}
            onChange={(e) => {
              setFormData((p) => ({ ...p, description: e.target.value }));
              if (errors.description)
                setErrors((p) => ({ ...p, description: "" }));
            }}
            placeholder="Brief description of this resource category..."
            error={errors.description}
          />
        </div>

        {/* Status */}
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={formData.status}
          onValueChange={(val) =>
            setFormData((p) => ({
              ...p,
              status: val as "active" | "inactive",
            }))
          }
          className="w-full dark:border-darkBorder dark:focus:border-primary"
        />
      </form>
    </Modal>
  );
}
