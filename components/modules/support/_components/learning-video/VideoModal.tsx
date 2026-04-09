"use client";

import { useState } from "react";
import {
  SupportLearningVideo,
  SupportResource,
} from "../../_types/support.types";
import { Input, Modal } from "@/components/ui";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { X } from "lucide-react";

interface VideoModalProps {
  video: SupportLearningVideo | null;
  resources: SupportResource[];
  onClose: () => void;
  onSave: (data: Partial<SupportLearningVideo>) => void;
}

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export default function VideoModal({
  video,
  resources,
  onClose,
  onSave,
}: VideoModalProps) {
  const blank = {
    title: "",
    description: "",
    resourceId: resources[0]?.id ?? "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
    tags: [] as string[],
    status: "draft" as const,
  };

  const [formData, setFormData] = useState(
    video
      ? {
          title: video.title,
          description: video.description,
          resourceId: video.resourceId,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          tags: video.tags,
          status: video.status,
        }
      : blank,
  );

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!formData.resourceId) e.resourceId = "Resource is required";
    if (!formData.videoUrl.trim()) e.videoUrl = "Video URL is required";
    if (!formData.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      id: video?.id ?? `vid_${Date.now()}`,
      ...formData,
      views: video?.views ?? 0,
      createdAt: video?.createdAt ?? new Date().toISOString(),
    });
  };

  const resourceOptions = resources.map((r) => ({
    value: r.id,
    label: `${r.icon} ${r.name}`,
  }));

  return (
    <Modal
      open
      onClose={onClose}
      title={video ? "Edit Learning Video" : "Add Learning Video"}
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
          <Button type="submit" form="video-form" className="flex-1 h-10">
            {video ? "Save Changes" : "Create Video"}
          </Button>
        </div>
      }
    >
      <form id="video-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Video Title"
          placeholder="e.g. Getting Started in 5 Minutes"
          value={formData.title}
          onValueChange={(val) => {
            setFormData((p) => ({ ...p, title: val }));
            if (errors.title) setErrors((p) => ({ ...p, title: "" }));
          }}
          error={errors.title}
          requiredSign
          className="dark:border-darkBorder dark:focus:border-primary"
        />

        {/* Resource + Status */}
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
                status: val as "published" | "draft",
              }))
            }
            className="w-full dark:border-darkBorder"
          />
        </div>

        {/* Video URL */}
        <Input
          label="Video URL / Embed Link"
          placeholder="https://www.youtube.com/watch?v=..."
          value={formData.videoUrl}
          onValueChange={(val) => {
            setFormData((p) => ({ ...p, videoUrl: val }));
            if (errors.videoUrl) setErrors((p) => ({ ...p, videoUrl: "" }));
          }}
          error={errors.videoUrl}
          requiredSign
          helperText="YouTube, Vimeo, or direct embed URL."
          className="dark:border-darkBorder dark:focus:border-primary"
        />

        {/* Thumbnail + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Thumbnail URL"
            placeholder="https://..."
            value={formData.thumbnailUrl}
            onValueChange={(val) =>
              setFormData((p) => ({ ...p, thumbnailUrl: val }))
            }
            className="dark:border-darkBorder dark:focus:border-primary"
          />
          <Input
            label="Duration"
            placeholder="e.g. 12:34"
            value={formData.duration}
            onValueChange={(val) =>
              setFormData((p) => ({ ...p, duration: val }))
            }
            helperText="Format: MM:SS"
            className="dark:border-darkBorder dark:focus:border-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#344054] dark:text-gray-100">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => {
              setFormData((p) => ({ ...p, description: e.target.value }));
              if (errors.description)
                setErrors((p) => ({ ...p, description: "" }));
            }}
            placeholder="What will viewers learn from this video?"
            className={`w-full rounded-md border p-3 text-sm bg-white dark:bg-darkBg outline-none focus:border-gray-400 placeholder:text-gray-400 dark:text-white resize-none transition-colors ${
              errors.description
                ? "border-red-500"
                : "border-border dark:border-darkBorder dark:focus:border-primary"
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description}</p>
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
      </form>
    </Modal>
  );
}
