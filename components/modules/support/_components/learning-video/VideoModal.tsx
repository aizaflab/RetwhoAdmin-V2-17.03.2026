"use client";

import { useState } from "react";
import {
  SupportLearningVideo,
  SupportResource,
} from "../../_types/support.types";
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
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea/Textarea";

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
    label: r.name,
  }));

  return (
    <Dialog
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
        <Field>
          <FieldLabel htmlFor="video-title">
            Video Title
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="video-title"
            name="title"
            placeholder="e.g. Getting Started in 5 Minutes"
            value={formData.title}
            onValueChange={(val) => {
              setFormData((p) => ({ ...p, title: val }));
              if (errors.title) setErrors((p) => ({ ...p, title: "" }));
            }}
            aria-invalid={errors.title ? true : undefined}
            className="bg-transparent"
          />
          {errors.title && <FieldError>{errors.title}</FieldError>}
        </Field>

        {/* Resource + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel id="video-resource-label" htmlFor="video-resource">
              Resource Category
            </FieldLabel>
            <Select
              id="video-resource"
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
            <FieldLabel id="video-status-label" htmlFor="video-status">
              Status
            </FieldLabel>
            <Select
              id="video-status"
              value={formData.status}
              onValueChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  status: val as "published" | "draft",
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

        {/* Video URL */}
        <Field>
          <FieldLabel htmlFor="video-url">
            Video URL / Embed Link
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="video-url"
            name="videoUrl"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={formData.videoUrl}
            onValueChange={(val) => {
              setFormData((p) => ({ ...p, videoUrl: val }));
              if (errors.videoUrl) setErrors((p) => ({ ...p, videoUrl: "" }));
            }}
            aria-invalid={errors.videoUrl ? true : undefined}
            className="bg-transparent"
          />
          {errors.videoUrl ? (
            <FieldError>{errors.videoUrl}</FieldError>
          ) : (
            <FieldDescription>
              YouTube, Vimeo, or direct embed URL.
            </FieldDescription>
          )}
        </Field>

        {/* Thumbnail + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="video-thumbnail">Thumbnail URL</FieldLabel>
            <Input
              id="video-thumbnail"
              name="thumbnailUrl"
              type="url"
              placeholder="https://..."
              value={formData.thumbnailUrl}
              onValueChange={(val) =>
                setFormData((p) => ({ ...p, thumbnailUrl: val }))
              }
              className="bg-transparent"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="video-duration">Duration</FieldLabel>
            <Input
              id="video-duration"
              name="duration"
              placeholder="e.g. 12:34"
              value={formData.duration}
              onValueChange={(val) =>
                setFormData((p) => ({ ...p, duration: val }))
              }
              className="bg-transparent"
            />
            <FieldDescription>Format: MM:SS</FieldDescription>
          </Field>
        </div>

        {/* Description */}
        <Field>
          <FieldLabel htmlFor="video-description">
            Description
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Textarea
            id="video-description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={(e) => {
              setFormData((p) => ({ ...p, description: e.target.value }));
              if (errors.description)
                setErrors((p) => ({ ...p, description: "" }));
            }}
            placeholder="What will viewers learn from this video?"
            invalid={!!errors.description}
            className="bg-transparent"
          />
          {errors.description && <FieldError>{errors.description}</FieldError>}
        </Field>

        {/* Tags */}
        <Field>
          <FieldLabel htmlFor="video-tags">Tags</FieldLabel>
          <div className="flex items-end gap-2">
            <Input
              id="video-tags"
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
