"use client";

import { useState, useRef } from "react";
import { BlogPost, BlogCategory } from "../_types/blog.types";
import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { CloudUploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";
import TextEditor from "@/components/ui/editor/TextEditor";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

interface BlogPostFormProps {
  initialData?: BlogPost | null;
  categories: BlogCategory[];
  onSave: (data: Partial<BlogPost>) => void;
}

export default function BlogPostForm({
  initialData,
  categories,
  onSave,
}: BlogPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setFormData((prev) => ({ ...prev, image: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    categoryId: initialData?.categoryId || "",
    image: initialData?.image || "",
    altText: initialData?.altText || "",
    imageTitle: initialData?.imageTitle || "",
    tags: initialData?.tags || [],
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    content: initialData?.content || "",
    status: initialData?.status || "draft",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagDraft, setTagDraft] = useState("");

  /** Commits the draft as a tag; duplicates and blanks are ignored. */
  const addTag = () => {
    const tag = tagDraft.trim().replace(/,$/, "");
    if (!tag) return;
    setFormData((prev) =>
      prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] },
    );
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !initialData
        ? val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : prev.slug,
    }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
  };

  const validate = () => {
    const newErrs: Record<string, string> = {};
    if (!formData.title.trim()) newErrs.title = "Title is required";
    if (!formData.slug.trim()) newErrs.slug = "Slug is required";
    if (!formData.categoryId) newErrs.categoryId = "Category is required";
    if (formData.metaTitle.length > 60)
      newErrs.metaTitle = "Meta title exceeds 60 characters";
    if (formData.metaDescription.length > 160)
      newErrs.metaDescription = "Meta description exceeds 160 characters";

    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: initialData?.id || `post_${Date.now()}`,
      ...formData,
      views: initialData?.views || 0,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    } as Partial<BlogPost>);
  };

  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-3 sm:p-5 rounded-xl border border-border/50">
        {/* Left Column */}
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="post-title">Blog Title</FieldLabel>
            <Input
              id="post-title"
              name="title"
              placeholder="Enter blog title"
              value={formData.title}
              onValueChange={handleTitleChange}
              aria-invalid={errors.title ? true : undefined}
              className="bg-transparent"
            />
            {errors.title && <FieldError>{errors.title}</FieldError>}
          </Field>

          <Field>
            <FieldLabel id="post-category-label" htmlFor="post-category">
              Blog Category
            </FieldLabel>
            <Select
              id="post-category"
              value={formData.categoryId}
              onValueChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  categoryId: val,
                }));
                if (errors.categoryId)
                  setErrors((prev) => ({ ...prev, categoryId: "" }));
              }}
            >
              <SelectTrigger error={!!errors.categoryId}>
                <SelectValue
                  placeholder="Select a category"
                  options={categoryOptions}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={categoryOptions} />
              </SelectContent>
            </Select>
            {errors.categoryId && <FieldError>{errors.categoryId}</FieldError>}
          </Field>

          <Field>
            <FieldLabel id="post-status-label" htmlFor="post-status">
              Blog Status
            </FieldLabel>
            <Select
              id="post-status"
              value={formData.status}
              onValueChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  status: val as "published" | "draft" | "archived",
                }));
              }}
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

          <Field>
            <FieldLabel htmlFor="post-alt-text">Alternative Text</FieldLabel>
            <Input
              id="post-alt-text"
              name="altText"
              placeholder="Enter blog alternative text"
              value={formData.altText}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, altText: val }))
              }
              className="bg-transparent"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="post-image-title">Image Title</FieldLabel>
            <Input
              id="post-image-title"
              name="imageTitle"
              placeholder="Enter blog image title"
              value={formData.imageTitle}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, imageTitle: val }))
              }
              className="bg-transparent"
            />
          </Field>
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full space-y-4">
          <Field>
            <FieldLabel htmlFor="post-slug">Slug</FieldLabel>
            <Input
              id="post-slug"
              name="slug"
              placeholder="Enter blog slug"
              value={formData.slug}
              onValueChange={(val) => {
                setFormData((prev) => ({ ...prev, slug: val }));
                if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
              }}
              aria-invalid={errors.slug ? true : undefined}
              className="bg-transparent"
            />
            {errors.slug && <FieldError>{errors.slug}</FieldError>}
          </Field>

          <Field className="flex-1">
            <FieldLabel htmlFor="post-banner">Featured Image</FieldLabel>
            <div
              id="post-banner"
              role="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center flex-1 cursor-pointer hover:border-primary/50 transition-colors bg-transparent min-h-45"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.image ? (
                <div className="absolute inset-2 rounded-md overflow-hidden animate-fadeIn">
                  <Image
                    src={formData.image}
                    className="w-full h-full object-cover"
                    alt="Preview"
                    width={100}
                    height={100}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, image: "" }));
                    }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 shadow"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-2 border border-border rounded-lg bg-card shadow-sm">
                    <CloudUploadIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      <span className="text-primary">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Field>
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-card p-3 sm:p-5 rounded-xl border border-border/50 space-y-4">
        <Field>
          <FieldLabel htmlFor="post-tags">
            Tags
            <span className="text-xs font-normal text-muted-foreground">
              press Enter to add
            </span>
          </FieldLabel>
          <Input
            id="post-tags"
            name="tags"
            placeholder="e.g. web, frontend"
            value={tagDraft}
            onValueChange={setTagDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                // Enter would submit the form — the key adds a tag instead.
                e.preventDefault();
                addTag();
              } else if (e.key === "Backspace" && !tagDraft) {
                setFormData((prev) => ({
                  ...prev,
                  tags: prev.tags.slice(0, -1),
                }));
              }
            }}
            onBlur={addTag}
            className="bg-transparent"
          />
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <XIcon className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="post-meta-title">
            Meta Title
            <span className="text-xs font-normal text-muted-foreground">
              {formData.metaTitle.length}/60
            </span>
          </FieldLabel>
          <Input
            id="post-meta-title"
            name="metaTitle"
            placeholder="Enter blog meta title"
            value={formData.metaTitle}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, metaTitle: val }))
            }
            aria-invalid={errors.metaTitle ? true : undefined}
            className="bg-transparent"
          />
          {errors.metaTitle && <FieldError>{errors.metaTitle}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="post-meta-description">
            Meta Description
            <span className="text-xs font-normal text-muted-foreground">
              {formData.metaDescription.length}/160
            </span>
          </FieldLabel>
          <Textarea
            id="post-meta-description"
            name="metaDescription"
            value={formData.metaDescription}
            onChange={(e) =>
              setFormData({ ...formData, metaDescription: e.target.value })
            }
            rows={3}
            invalid={
              !!errors.metaDescription || formData.metaDescription.length > 160
            }
            placeholder="Enter blog meta description"
            className="bg-transparent"
          />
          {errors.metaDescription && (
            <FieldError>{errors.metaDescription}</FieldError>
          )}
        </Field>
      </div>

      {/* Content Section */}
      <div className="bg-card p-3 sm:p-5 rounded-xl border border-border/50">
        <FieldLabel className="mb-1.5">Content</FieldLabel>

        <TextEditor
          value={formData.content}
          onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
          placeholder="Start writing..."
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-5">
        <Button type="submit" className="px-8">
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="px-7 text-muted-foreground"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
