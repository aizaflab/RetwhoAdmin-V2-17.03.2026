"use client";

import { useState, useRef } from "react";
import { BlogPost, BlogCategory } from "../_types/blog.types";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import TextEditor from "@/components/ui/editor/TextEditor";
import { CloudUploadIcon } from "lucide-react";
import Image from "next/image";
import { Select } from "@/components/ui/select/Select";

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
          setFormData((prev) => ({ ...prev, bannerImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    categoryId: initialData?.categoryId || "",
    bannerImage: initialData?.bannerImage || "",
    altText: initialData?.altText || "",
    imageTitle: initialData?.imageTitle || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    content: initialData?.content || "",
    status: initialData?.status || "draft",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const statusOptions = [
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-darkBg p-3 sm:p-5 rounded-xl border border-border/50 dark:border-darkBorder">
        {/* Left Column */}
        <div className="space-y-4">
          <Input
            label="Blog Title *"
            placeholder="Enter blog title"
            value={formData.title}
            onValueChange={handleTitleChange}
            error={errors.title}
            fullWidth
            className="dark:border-darkBorder dark:focus:border-[#1b2241]"
          />

          <div>
            <Select
              label="Blog Category"
              options={categoryOptions}
              value={formData.categoryId}
              onValueChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  categoryId: val,
                }));
                if (errors.categoryId)
                  setErrors((prev) => ({ ...prev, categoryId: "" }));
              }}
              className={`h-11 w-full bg-white dark:bg-darkBg ${errors.categoryId ? "border-red-500" : "border-border dark:border-[#424242]"}`}
              error={errors.categoryId}
            />
          </div>

          <div className="py-6">
            <Select
              label="Blog Status"
              options={statusOptions}
              value={formData.status}
              onValueChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  status: val as "published" | "draft" | "archived",
                }));
              }}
              className="h-11 w-full bg-white dark:bg-darkBg border-border dark:border-[#424242]"
            />
          </div>

          <Input
            label="Alternative Text"
            placeholder="Enter blog alternative text"
            value={formData.altText}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, altText: val }))
            }
            fullWidth
            className="dark:border-darkBorder dark:focus:border-[#1b2241]"
          />

          <Input
            label="Image Title"
            placeholder="Enter blog image title"
            value={formData.imageTitle}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, imageTitle: val }))
            }
            fullWidth
            className="dark:border-darkBorder dark:focus:border-[#1b2241]"
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full space-y-4">
          <Input
            label="Slug"
            placeholder="Enter blog slug"
            value={formData.slug}
            onValueChange={(val) => {
              setFormData((prev) => ({ ...prev, slug: val }));
              if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
            }}
            error={errors.slug}
            fullWidth
            className="dark:border-darkBorder dark:focus:border-[#1b2241]"
          />

          <div className="space-y-1.5 flex-1 flex flex-col">
            <label className="text-sm font-medium dark:font-[350] text-[#344054] dark:text-gray-100 block">
              Featured Image
            </label>
            <div
              role="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-[#EAECF0] dark:border-darkBorder rounded-lg p-6 flex flex-col items-center justify-center flex-1 cursor-pointer hover:border-[#6C63FF]  bg-white dark:bg-darkBg min-h-45"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.bannerImage ? (
                <div className="absolute inset-2 rounded-md overflow-hidden animate-fadeIn">
                  <Image
                    src={formData.bannerImage}
                    className="w-full h-full object-cover"
                    alt="Preview"
                    width={100}
                    height={100}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, bannerImage: "" }));
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
                  <div className="p-2 border border-[#EAECF0] rounded-lg bg-white dark:bg-darkBorder/50 dark:border-darkBorder shadow-sm">
                    <CloudUploadIcon className="h-6 w-6 text-[#667085] dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#475467] font-medium">
                      <span className="text-[#6C63FF]">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-[#667085]">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-white dark:bg-darkBg p-3 sm:p-5 rounded-xl border border-border/50 dark:border-darkBorder space-y-4">
        <div className="relative">
          <Input
            label={`Meta Title (Characters: ${formData.metaTitle.length}/60)`}
            placeholder="Enter blog meta title"
            value={formData.metaTitle}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, metaTitle: val }))
            }
            error={errors.metaTitle}
            fullWidth
            className="dark:border-darkBorder dark:focus:border-[#1b2241]"
          />
        </div>

        <div className="relative">
          <label className="text-sm font-medium dark:font-[350] text-[#344054] dark:text-gray-100 block mb-1">
            {`Meta Description (Characters: ${formData.metaDescription.length}/160)`}
          </label>
          <textarea
            value={formData.metaDescription}
            onChange={(e) =>
              setFormData({ ...formData, metaDescription: e.target.value })
            }
            rows={3}
            className={`w-full rounded-md border ${formData.metaDescription.length > 160 ? "border-red-500" : "border-border dark:border-[#424242]"} p-3 text-sm bg-white dark:bg-darkBg outline-none focus:border-gray-400 placeholder:text-gray-400 dark:border-darkBorder dark:focus:border-[#1b2241]`}
            placeholder="Enter blog meta description"
          />
          {errors.metaDescription && (
            <p className="text-xs text-red-500 mt-1">
              {errors.metaDescription}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-darkBg p-3 sm:p-5 rounded-xl border border-border/50 dark:border-darkBorder ">
        <label className="text-sm font-medium dark:font-[350] text-[#344054] dark:text-gray-100 block mb-1.5">
          Content
        </label>

        <TextEditor
          value={formData.content}
          onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
          placeholder="Start writing..."
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-5">
        <Button
          type="submit"
          className="px-8 bg-[#0284c7] hover:bg-[#0284c7]/90 text-white"
        >
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="px-7  text-gray-500"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
