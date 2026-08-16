"use client";

import { useState } from "react";
import { SupportArticle, SupportResource } from "../../_types/support.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import TextEditor from "@/components/ui/editor/TextEditor";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface ArticleFormProps {
  initialData?: SupportArticle | null;
  resources: SupportResource[];
  onSave: (data: Partial<SupportArticle>) => void;
}

function toSlug(val: string) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export default function ArticleForm({
  initialData,
  resources,
  onSave,
}: ArticleFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    resourceId: initialData?.resourceId ?? resources[0]?.id ?? "",
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    tags: initialData?.tags ?? ([] as string[]),
    status: (initialData?.status ?? "draft") as
      | "published"
      | "draft"
      | "archived",
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (val: string) => {
    setFormData((p) => ({
      ...p,
      title: val,
      slug: !initialData ? toSlug(val) : p.slug,
    }));
    if (errors.title) setErrors((p) => ({ ...p, title: "" }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((p) => ({ ...p, tags: [...p.tags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.slug.trim()) e.slug = "Slug is required";
    if (!formData.resourceId) e.resourceId = "Resource is required";
    if (!formData.excerpt.trim()) e.excerpt = "Excerpt is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      id: initialData?.id ?? `art_${Date.now()}`,
      ...formData,
      views: initialData?.views ?? 0,
      helpful: initialData?.helpful ?? 0,
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const resourceOptions = resources.map((r) => ({
    value: r.id,
    label: `${r.name}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Info Card */}
      <div className="bg-card p-3 sm:p-5 rounded-xl border border-border/50 space-y-4">
        {/* Title */}
        <Field>
          <FieldLabel htmlFor="article-form-title">
            Article Title
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="article-form-title"
            name="title"
            placeholder="e.g. How to Create Your First Order"
            value={formData.title}
            onValueChange={handleTitleChange}
            aria-invalid={errors.title ? true : undefined}
            className="bg-transparent"
          />
          {errors.title && <FieldError>{errors.title}</FieldError>}
        </Field>

        {/* Slug */}
        <Field>
          <FieldLabel htmlFor="article-form-slug">
            Slug
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="article-form-slug"
            name="slug"
            placeholder="e.g. how-to-create-first-order"
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
            <FieldDescription>Auto-generated from the title.</FieldDescription>
          )}
        </Field>

        {/* Resource + Status row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel
              id="article-form-resource-label"
              htmlFor="article-form-resource"
            >
              Resource Category
            </FieldLabel>
            <Select
              id="article-form-resource"
              value={formData.resourceId}
              onValueChange={(val) => {
                setFormData((p) => ({ ...p, resourceId: val }));
                if (errors.resourceId)
                  setErrors((p) => ({ ...p, resourceId: "" }));
              }}
            >
              <SelectTrigger error={!!errors.resourceId}>
                <SelectValue
                  placeholder="Select a resource"
                  options={resourceOptions}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={resourceOptions} />
              </SelectContent>
            </Select>
            {errors.resourceId && <FieldError>{errors.resourceId}</FieldError>}
          </Field>

          <Field>
            <FieldLabel
              id="article-form-status-label"
              htmlFor="article-form-status"
            >
              Status
            </FieldLabel>
            <Select
              id="article-form-status"
              value={formData.status}
              onValueChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  status: val as "published" | "draft" | "archived",
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
        </div>

        {/* Excerpt */}
        <Field>
          <FieldLabel htmlFor="article-form-excerpt">
            Excerpt
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Textarea
            id="article-form-excerpt"
            name="excerpt"
            rows={2}
            resize="none"
            value={formData.excerpt}
            onChange={(e) => {
              setFormData((p) => ({ ...p, excerpt: e.target.value }));
              if (errors.excerpt) setErrors((p) => ({ ...p, excerpt: "" }));
            }}
            placeholder="Short description shown in search results..."
            invalid={!!errors.excerpt}
            className="bg-transparent"
          />
          {errors.excerpt && <FieldError>{errors.excerpt}</FieldError>}
        </Field>

        {/* Tags */}
        <Field>
          <FieldLabel htmlFor="article-form-tags">Tags</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="article-form-tags"
              name="tags"
              value={tagInput}
              onValueChange={setTagInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type tag & press Enter"
              className="flex-1 bg-transparent"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 text-sm"
              onClick={addTag}
            >
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>
      </div>

      {/* Content Editor Card */}
      <div className="bg-card p-3 sm:p-5 rounded-xl border border-border/50">
        <FieldLabel className="mb-3">Content</FieldLabel>
        <TextEditor
          value={formData.content}
          onChange={(val) => setFormData((p) => ({ ...p, content: val }))}
          placeholder="Start writing your article..."
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          className="px-7 text-muted-foreground"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="px-8">
          {initialData ? "Save Changes" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}
