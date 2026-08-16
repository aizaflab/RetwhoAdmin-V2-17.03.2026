"use client";

import { useState } from "react";
import { SupportArticle, SupportResource } from "../../_types/support.types";
import {
  Dialog,
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
import { X } from "lucide-react";

interface ArticleModalProps {
  article: SupportArticle | null;
  resources: SupportResource[];
  onClose: () => void;
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

export default function ArticleModal({
  article,
  resources,
  onClose,
  onSave,
}: ArticleModalProps) {
  const blank = {
    title: "",
    slug: "",
    resourceId: resources[0]?.id ?? "",
    excerpt: "",
    content: "",
    tags: [] as string[],
    status: "draft" as const,
  };

  const [formData, setFormData] = useState(
    article
      ? {
          title: article.title,
          slug: article.slug,
          resourceId: article.resourceId,
          excerpt: article.excerpt,
          content: article.content,
          tags: article.tags,
          status: article.status,
        }
      : blank,
  );

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (val: string) => {
    setFormData((p) => ({
      ...p,
      title: val,
      slug: !article ? toSlug(val) : p.slug,
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
      id: article?.id ?? `art_${Date.now()}`,
      ...formData,
      views: article?.views ?? 0,
      helpful: article?.helpful ?? 0,
      createdAt: article?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const resourceOptions = resources.map((r) => ({
    value: r.id,
    label: `${r.name}`,
  }));

  return (
    <Dialog
      open
      onClose={onClose}
      title={article ? "Edit Article" : "Add Article"}
      size="large"
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
          <Button type="submit" form="article-form" className="flex-1 h-10">
            {article ? "Save Changes" : "Create Article"}
          </Button>
        </div>
      }
    >
      <form id="article-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Field>
          <FieldLabel htmlFor="article-title">
            Article Title
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="article-title"
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
          <FieldLabel htmlFor="article-slug">
            Slug
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="article-slug"
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
            <FieldLabel id="article-resource-label" htmlFor="article-resource">
              Resource Category
            </FieldLabel>
            <Select
              id="article-resource"
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
            <FieldLabel id="article-status-label" htmlFor="article-status">
              Status
            </FieldLabel>
            <Select
              id="article-status"
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
          <FieldLabel htmlFor="article-excerpt">
            Excerpt
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Textarea
            id="article-excerpt"
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

        {/* Content */}
        <Field>
          <FieldLabel htmlFor="article-content">Content</FieldLabel>
          <Textarea
            id="article-content"
            name="content"
            rows={6}
            value={formData.content}
            onChange={(e) =>
              setFormData((p) => ({ ...p, content: e.target.value }))
            }
            placeholder="Full article content (supports HTML)..."
            className="bg-transparent"
          />
        </Field>

        {/* Tags */}
        <Field>
          <FieldLabel htmlFor="article-tags">Tags</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="article-tags"
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
      </form>
    </Dialog>
  );
}
