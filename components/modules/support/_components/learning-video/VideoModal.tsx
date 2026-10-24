"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, PlusIcon, XIcon } from "lucide-react";
import { Dialog, Field, FieldError, FieldLabel, Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import { Button } from "@/components/ui/button/Button";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

import {
  SUPPORT_STATUS_OPTIONS,
  isHttpUrl,
  parseVideoUrl,
  resourceRefId,
  resourceRefTitle,
  youtubeThumbnail,
} from "../../_data/support-options";
import type {
  SupportResourceOption,
  SupportStatus,
  SupportVideoItem,
  SupportVideoPayload,
} from "../../_types/support.types";

interface VideoModalProps {
  /** Present in edit mode; null to create a new video. */
  video: SupportVideoItem | null;
  /** Published resources from `GET /support/resources/options`. */
  resourceOptions: SupportResourceOption[];
  resourcesLoading?: boolean;
  onClose: () => void;
  /**
   * Must reject on failure — the rejection is what surfaces the API's reason.
   * Partial on edit: an unchanged resource is left out (see `handleSubmit`).
   */
  onSave: (
    payload: SupportVideoPayload | Partial<SupportVideoPayload>,
    id?: string,
  ) => Promise<unknown>;
  saving?: boolean;
}

export default function VideoModal({
  video,
  resourceOptions,
  resourcesLoading = false,
  onClose,
  onSave,
  saving = false,
}: VideoModalProps) {
  const initialResourceId = video ? resourceRefId(video) : "";

  // Field names match the API body, so this state object is the payload.
  const [formData, setFormData] = useState({
    title: video?.title ?? "",
    supportResourcesId: initialResourceId,
    status: (video?.status ?? "draft") as SupportStatus,
    videoUrl: video?.videoUrl ?? "",
    thumbnailUrl: video?.thumbnailUrl ?? "",
    description: video?.description ?? "",
    duration: video?.duration ?? "",
    tags: video?.tags ?? ([] as string[]),
  });

  const [tagDraft, setTagDraft] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbBroken, setThumbBroken] = useState(false);

  // Only published resources are offered. One the video already sits under
  // but that has since been unpublished is kept, so the picker never blanks.
  const selectOptions = useMemo(() => {
    const title = video ? resourceRefTitle(video) : "";
    const missing =
      initialResourceId &&
      title &&
      !resourceOptions.some((o) => o.value === initialResourceId);

    return [
      ...(missing
        ? [
            {
              value: initialResourceId,
              label: title,
              description: "(not published)",
            },
          ]
        : []),
      ...resourceOptions,
    ];
  }, [resourceOptions, video, initialResourceId]);

  const source = isHttpUrl(formData.videoUrl.trim())
    ? parseVideoUrl(formData.videoUrl.trim())
    : null;
  const suggestedThumb =
    source?.kind === "youtube" ? youtubeThumbnail(source.id) : "";
  const thumbPreview = isHttpUrl(formData.thumbnailUrl.trim())
    ? formData.thumbnailUrl.trim()
    : "";

  const set = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /** Commits the draft as a tag; duplicates and blanks are ignored. */
  const addTag = () => {
    const tag = tagDraft.trim().replace(/,$/, "").toLowerCase();
    if (!tag) return;
    setFormData((prev) =>
      prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] },
    );
    setTagDraft("");
  };

  const removeTag = (tag: string) =>
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));

  // Mirrors the API's own rules, so a typo is caught before the round trip.
  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.title.trim()) next.title = "Title is required";
    if (!formData.supportResourcesId)
      next.supportResourcesId = "Pick the resource this video belongs to";

    if (!formData.videoUrl.trim()) next.videoUrl = "Video URL is required";
    else if (!isHttpUrl(formData.videoUrl.trim()))
      next.videoUrl = "Enter a full URL starting with https://";

    if (!formData.thumbnailUrl.trim())
      next.thumbnailUrl = "Thumbnail URL is required";
    else if (!isHttpUrl(formData.thumbnailUrl.trim()))
      next.thumbnailUrl = "Enter a full URL starting with https://";

    if (!formData.description.trim())
      next.description = "Description is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in the highlighted fields.");
      return;
    }

    const title = formData.title.trim();
    const duration = formData.duration.trim();
    const payload: SupportVideoPayload = {
      title,
      supportResourcesId: formData.supportResourcesId,
      status: formData.status,
      videoUrl: formData.videoUrl.trim(),
      thumbnailUrl: formData.thumbnailUrl.trim(),
      description: formData.description.trim(),
      tags: formData.tags,
      ...(duration || video ? { duration } : {}),
    };

    // The API re-checks that a sent resource is published. Leaving an
    // unchanged one out lets a video under a since-unpublished resource
    // still be edited.
    const { supportResourcesId, ...rest } = payload;
    const body =
      video && supportResourcesId === initialResourceId ? rest : payload;

    try {
      await onSave(body, video?._id);
      toast.success(
        video
          ? `Video "${title}" updated successfully`
          : `Video "${title}" added successfully`,
      );
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        video
          ? "Could not update the video. Please try again."
          : "Could not add the video. Please try again.",
      );

      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, title: message }));
      }

      toast.error(message);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={video ? "Edit Video" : "Add Video"}
      size="large"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="video-form"
            className="flex-1 h-10"
            loading={saving}
            loadingText="Saving..."
          >
            {video ? "Save Changes" : "Add Video"}
          </Button>
        </div>
      }
    >
      <form
        id="video-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Field>
          <FieldLabel htmlFor="video-title">
            Title
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="video-title"
            name="title"
            placeholder="e.g. How to Use Our Support System"
            value={formData.title}
            onValueChange={(val) => set("title", val)}
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
          <FieldLabel htmlFor="video-url">
            Video URL
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
            onValueChange={(val) => set("videoUrl", val)}
            aria-invalid={errors.videoUrl ? true : undefined}
            className="bg-transparent"
          />
          {errors.videoUrl ? (
            <FieldError>{errors.videoUrl}</FieldError>
          ) : (
            <p className="text-xs text-muted-foreground">
              {source?.kind === "youtube"
                ? "YouTube video detected — it will play inline."
                : source?.kind === "vimeo"
                  ? "Vimeo video detected — it will play inline."
                  : source?.kind === "file"
                    ? "Direct video file detected."
                    : "YouTube, Vimeo or a direct .mp4 link."}
            </p>
          )}
        </Field>

        {/* Thumbnail with live preview */}
        <Field>
          <FieldLabel htmlFor="video-thumbnail">
            Thumbnail URL
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <div className="flex gap-3">
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {thumbPreview && !thumbBroken ? (
                // Arbitrary hosts — next/image would need each one allowlisted.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbPreview}
                  alt="Thumbnail preview"
                  className="h-full w-full object-cover"
                  onError={() => setThumbBroken(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="size-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Input
                id="video-thumbnail"
                name="thumbnailUrl"
                type="url"
                placeholder="https://..."
                value={formData.thumbnailUrl}
                onValueChange={(val) => {
                  set("thumbnailUrl", val);
                  setThumbBroken(false);
                }}
                aria-invalid={errors.thumbnailUrl ? true : undefined}
                className="bg-transparent"
              />
              {errors.thumbnailUrl ? (
                <FieldError>{errors.thumbnailUrl}</FieldError>
              ) : thumbBroken ? (
                <p className="text-xs text-warning">
                  This image could not be loaded — check the URL.
                </p>
              ) : suggestedThumb &&
                formData.thumbnailUrl.trim() !== suggestedThumb ? (
                <button
                  type="button"
                  onClick={() => {
                    set("thumbnailUrl", suggestedThumb);
                    setThumbBroken(false);
                  }}
                  className="cursor-pointer text-xs font-medium text-primary hover:underline"
                >
                  Use the YouTube thumbnail
                </button>
              ) : null}
            </div>
          </div>
        </Field>

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
            onChange={(e) => set("description", e.target.value)}
            placeholder="What will viewers learn from this video?"
            invalid={!!errors.description}
            className="bg-transparent"
          />
          {errors.description && <FieldError>{errors.description}</FieldError>}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="video-resource">
              Resource
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <SearchSelect
              // SearchSelect only reads `value` on mount — keyed on the list so
              // the label appears once the options arrive.
              key={selectOptions.length}
              id="video-resource"
              fullWidth
              className="w-full"
              options={selectOptions}
              value={formData.supportResourcesId}
              placeholder={
                resourcesLoading ? "Loading resources…" : "Select a resource"
              }
              searchPlaceholder="Search resources..."
              error={errors.supportResourcesId}
              disabled={resourcesLoading && selectOptions.length === 0}
              onValueChange={(val) => set("supportResourcesId", val)}
            />
            {errors.supportResourcesId ? (
              <FieldError>{errors.supportResourcesId}</FieldError>
            ) : (
              !resourcesLoading &&
              selectOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No published resources yet — publish one first.
                </p>
              )
            )}
          </Field>

          <Field>
            <FieldLabel id="video-status-label" htmlFor="video-status">
              Status
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <Select
              id="video-status"
              value={formData.status}
              onValueChange={(val) => set("status", val as SupportStatus)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Select status"
                  options={SUPPORT_STATUS_OPTIONS}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={SUPPORT_STATUS_OPTIONS} />
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="video-duration">
              Duration{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id="video-duration"
              name="duration"
              placeholder="e.g. 5m 30s"
              value={formData.duration}
              onValueChange={(val) => set("duration", val)}
              className="bg-transparent"
            />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="video-tags">
              Tags{" "}
              <span className="text-xs font-normal text-muted-foreground">
                press Enter or Add
              </span>
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="video-tags"
                name="tags"
                value={tagDraft}
                onValueChange={setTagDraft}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    // Enter would submit the form — the key adds a tag.
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
                placeholder="e.g. guide, tutorial"
                className="flex-1 bg-transparent"
              />
              {/* Blocking the mousedown keeps the input from blurring, which
                  would commit the tag before the click lands. */}
              <Button
                type="button"
                startIcon={<PlusIcon className="size-4" />}
                onMouseDown={(e) => e.preventDefault()}
                onClick={addTag}
                aria-label="Add tag"
                className="h-10 shrink-0 px-4"
              >
                Add
              </Button>
            </div>
          </Field>
        </div>

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove ${tag}`}
                  className="cursor-pointer transition-colors hover:text-destructive"
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </form>
    </Dialog>
  );
}
