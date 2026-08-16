"use client";

import { useState } from "react";
import { SupportResource } from "../../_types/support.types";
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
} from "@/components/ui/select/Select";
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
        <Field>
          <FieldLabel htmlFor="resource-name">
            Resource Name
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="resource-name"
            name="name"
            placeholder="e.g. Getting Started"
            value={formData.name}
            onValueChange={handleNameChange}
            aria-invalid={errors.name ? true : undefined}
            className="bg-transparent"
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        {/* Slug */}
        <Field>
          <FieldLabel htmlFor="resource-slug">
            Slug
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="resource-slug"
            name="slug"
            placeholder="e.g. getting-started"
            value={formData.slug}
            onValueChange={(val) => {
              setFormData((p) => ({ ...p, slug: val }));
              if (errors.slug) setErrors((p) => ({ ...p, slug: "" }));
            }}
            aria-invalid={errors.slug ? true : undefined}
            className="bg-transparent"
          />
          {errors.slug ? (
            <FieldError>{errors.slug}</FieldError>
          ) : (
            <FieldDescription>
              URL-friendly identifier. Auto-generated from the name.
            </FieldDescription>
          )}
        </Field>

        {/* Description */}
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
            rows={3}
            value={formData.description}
            onChange={(e) => {
              setFormData((p) => ({ ...p, description: e.target.value }));
              if (errors.description)
                setErrors((p) => ({ ...p, description: "" }));
            }}
            placeholder="Brief description of this resource category..."
            invalid={!!errors.description}
            className="bg-transparent"
          />
          {errors.description && <FieldError>{errors.description}</FieldError>}
        </Field>

        {/* Status */}
        <Field>
          <FieldLabel id="resource-status-label" htmlFor="resource-status">
            Status
          </FieldLabel>
          <Select
            id="resource-status"
            value={formData.status}
            onValueChange={(val) =>
              setFormData((p) => ({
                ...p,
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
