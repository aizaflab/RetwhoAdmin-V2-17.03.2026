"use client";

import { useState } from "react";
import { SupportArticle, SupportResource } from "../../_types/support.types";
import { Input } from "@/components/ui";
import { Select } from "@/components/ui/select/Select";
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
      <div className="bg-white dark:bg-darkBg p-3 sm:p-5 rounded-xl border border-border/50 dark:border-darkBorder space-y-4">
        {/* Title */}
        <Input
          label="Article Title"
          placeholder="e.g. How to Create Your First Order"
          value={formData.title}
          onValueChange={handleTitleChange}
          error={errors.title}
          requiredSign
          fullWidth
          className="dark:border-darkBorder dark:focus:border-primary"
        />

        {/* Slug */}
        <Input
          label="Slug"
          placeholder="e.g. how-to-create-first-order"
          value={formData.slug}
          onValueChange={(val) => {
            setFormData((p) => ({ ...p, slug: val }));
            if (errors.slug) setErrors((p) => ({ ...p, slug: "" }));
          }}
          error={errors.slug}
          requiredSign
          helperText="Auto-generated from title."
          fullWidth
          className="dark:border-darkBorder dark:focus:border-primary"
        />

        {/* Resource + Status row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Resource Category"
            options={resourceOptions}
            value={formData.resourceId}
            onValueChange={(val) => {
              setFormData((p) => ({ ...p, resourceId: val }));
              if (errors.resourceId)
                setErrors((p) => ({ ...p, resourceId: "" }));
            }}
            className={`w-full dark:border-darkBorder ${errors.resourceId ? "border-red-500" : ""}`}
            error={errors.resourceId}
          />

          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={formData.status}
            onValueChange={(val) =>
              setFormData((p) => ({
                ...p,
                status: val as "published" | "draft" | "archived",
              }))
            }
            className="w-full dark:border-darkBorder"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#344054] dark:text-gray-100">
            Excerpt <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={formData.excerpt}
            onChange={(e) => {
              setFormData((p) => ({ ...p, excerpt: e.target.value }));
              if (errors.excerpt) setErrors((p) => ({ ...p, excerpt: "" }));
            }}
            placeholder="Short description shown in search results..."
            className={`w-full rounded-md border p-3 text-sm bg-white dark:bg-darkBg outline-none focus:border-gray-400 placeholder:text-gray-400 dark:text-white resize-none transition-colors ${
              errors.excerpt
                ? "border-red-500"
                : "border-border dark:border-darkBorder dark:focus:border-primary"
            }`}
          />
          {errors.excerpt && (
            <p className="text-xs text-red-500">{errors.excerpt}</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#344054] dark:text-gray-100">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type tag & press Enter"
              className="flex-1 rounded-md border border-border dark:border-darkBorder px-3 py-2 text-sm bg-white dark:bg-darkBg outline-none focus:border-gray-400 dark:focus:border-primary placeholder:text-gray-400 dark:text-white"
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
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-blue-400"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Editor Card */}
      <div className="bg-white dark:bg-darkBg p-3 sm:p-5 rounded-xl border border-border/50 dark:border-darkBorder">
        <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block mb-3">
          Content
        </label>
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
          className="px-7 text-gray-500"
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
