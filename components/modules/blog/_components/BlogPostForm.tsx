"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { CloudUploadIcon, XIcon } from "lucide-react";
import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";
import TextEditor from "@/components/ui/editor/TextEditor";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

import { POST_STATUS_OPTIONS } from "../_data/blog-options";
import type {
  BlogPost,
  BlogPostPayload,
  BlogStatus,
} from "../_types/blog.types";

interface BlogPostFormProps {
  /** Present in edit mode; omit to create a new post. */
  initialData?: BlogPost | null;
  /** Assignable categories from `GET /blogs/categories/options`. */
  categoryOptions: SelectOption[];
  categoriesLoading?: boolean;
  /** Must reject on failure — the rejection is what surfaces the API's reason. */
  onSave: (
    payload: BlogPostPayload,
    imageFile: File | null,
  ) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
}

/** The API rejects anything larger, and the browser can check before uploading. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function BlogPostForm({
  initialData,
  categoryOptions,
  categoriesLoading,
  onSave,
  saving = false,
}: BlogPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initialData;

  // Field names match the API body, so this state object is (almost) the
  // payload — `slug` is absent because the server derives it from the title
  // and its strict schema rejects the field outright.
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    categoryId: initialData?.categoryId || "",
    alt: initialData?.image?.alt || "",
    imageTitle: initialData?.image?.title || "",
    tags: initialData?.tags || [],
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    content: initialData?.content || "",
    status: (initialData?.status || "draft") as BlogStatus,
  });

  /** The newly picked file, or null when the stored image is being kept. */
  const [imageFile, setImageFile] = useState<File | null>(null);
  /** The image already on the post; cleared when the author removes it. */
  const [storedImageUrl, setStoredImageUrl] = useState(
    initialData?.image?.url || "",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagDraft, setTagDraft] = useState("");

  // Derived rather than stored, so picking a file does not need a second
  // render pass to show its preview.
  const objectUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );

  // An object URL pins the file in memory until it is revoked, so each one is
  // released as soon as it is replaced or the form goes away.
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  // A freshly picked file always wins over whatever was stored.
  const imagePreview = objectUrl || storedImageUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file twice still fires a change event.
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Upload a JPG, PNG or WebP image",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, image: "Image must be under 10MB" }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setImageFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setStoredImageUrl("");
  };

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

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.title.trim()) next.title = "Title is required";
    else if (formData.title.trim().length < 2)
      next.title = "Title must be at least 2 characters";
    if (!formData.categoryId) next.categoryId = "Category is required";
    if (!formData.content.trim()) next.content = "Content is required";
    // The API insists a post ends up with an image, so a new post needs a file
    // and an edit needs either a new file or the one already stored.
    if (!imageFile && !imagePreview) next.image = "An image is required";
    if (formData.metaTitle.length > 60)
      next.metaTitle = "Meta title exceeds 60 characters";
    if (formData.metaDescription.length > 160)
      next.metaDescription = "Meta description exceeds 160 characters";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const title = formData.title.trim();

    const payload: BlogPostPayload = {
      title,
      content: formData.content,
      categoryId: formData.categoryId,
      tags: formData.tags,
      status: formData.status,
      ...(formData.metaTitle.trim()
        ? { metaTitle: formData.metaTitle.trim() }
        : {}),
      ...(formData.metaDescription.trim()
        ? { metaDescription: formData.metaDescription.trim() }
        : {}),
      // Only the author-typed halves — url/publicId are filled in by the
      // upload middleware and merged over the stored image server-side.
      image: {
        ...(formData.imageTitle.trim()
          ? { title: formData.imageTitle.trim() }
          : {}),
        ...(formData.alt.trim() ? { alt: formData.alt.trim() } : {}),
      },
    };

    try {
      await onSave(payload, imageFile);
      toast.success(
        isEdit
          ? `Post "${title}" updated successfully`
          : `Post "${title}" created successfully`,
      );
      router.push("/blog/post/manage");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        isEdit
          ? "Could not update the post. Please try again."
          : "Could not create the post. Please try again.",
      );

      // 409 here is the duplicate-title conflict, which the author fixes in
      // the title field rather than in a dismissible toast.
      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, title: message }));
      }

      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
              onValueChange={(val) => {
                setFormData((prev) => ({ ...prev, title: val }));
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              aria-invalid={errors.title ? true : undefined}
              className="bg-transparent"
            />
            {errors.title ? (
              <FieldError>{errors.title}</FieldError>
            ) : (
              <p className="text-xs text-muted-foreground">
                The URL slug is generated from this title.
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel id="post-category-label" htmlFor="post-category">
              Blog Category
            </FieldLabel>
            <Select
              id="post-category"
              value={formData.categoryId}
              onValueChange={(val) => {
                setFormData((prev) => ({ ...prev, categoryId: val }));
                if (errors.categoryId)
                  setErrors((prev) => ({ ...prev, categoryId: "" }));
              }}
            >
              <SelectTrigger error={!!errors.categoryId}>
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? "Loading categories..."
                      : "Select a category"
                  }
                  options={categoryOptions}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={categoryOptions} />
              </SelectContent>
            </Select>
            {errors.categoryId ? (
              <FieldError>{errors.categoryId}</FieldError>
            ) : (
              !categoriesLoading &&
              categoryOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No active categories. Create one first.
                </p>
              )
            )}
          </Field>

          <Field>
            <FieldLabel id="post-status-label" htmlFor="post-status">
              Blog Status
            </FieldLabel>
            <Select
              id="post-status"
              value={formData.status}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, status: val as BlogStatus }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Select status"
                  options={POST_STATUS_OPTIONS}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={POST_STATUS_OPTIONS} />
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="post-alt-text">Alternative Text</FieldLabel>
            <Input
              id="post-alt-text"
              name="alt"
              placeholder="Describes the image for screen readers"
              value={formData.alt}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, alt: val }))
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
          <Field className="flex-1">
            <FieldLabel htmlFor="post-banner">Image</FieldLabel>
            <div
              id="post-banner"
              role="button"
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors bg-transparent min-h-45 ${
                errors.image
                  ? "border-destructive"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
              {imagePreview ? (
                <div className="absolute inset-2 rounded-md overflow-hidden">
                  <Image
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    alt={formData.alt || "Image preview"}
                    width={600}
                    height={400}
                    // Blob previews and S3 URLs both bypass the optimiser.
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    aria-label="Remove image"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 shadow"
                  >
                    <XIcon className="size-4" />
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
                      JPG, PNG or WebP — max 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            {errors.image && <FieldError>{errors.image}</FieldError>}
            {isEdit && imagePreview && !imageFile && (
              <p className="text-xs text-muted-foreground">
                Keeping the current image. Pick a new file to replace it.
              </p>
            )}
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
              setFormData((prev) => ({
                ...prev,
                metaDescription: e.target.value,
              }))
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
          onChange={(val) => {
            setFormData((prev) => ({ ...prev, content: val }));
            if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
          }}
          placeholder="Start writing..."
        />
        {errors.content && <FieldError>{errors.content}</FieldError>}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="px-7 text-muted-foreground"
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-8"
          loading={saving}
          loadingText="Saving..."
        >
          {isEdit ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
