"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, XIcon } from "lucide-react";
import {
  Field,
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
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import { Button } from "@/components/ui/button/Button";
import TextEditor from "@/components/ui/editor/TextEditor";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

import {
  SUPPORT_STATUS_OPTIONS,
  resourceRefId,
  resourceRefTitle,
} from "../../_data/support-options";
import type {
  SupportArticleItem,
  SupportArticlePayload,
  SupportResourceOption,
  SupportStatus,
} from "../../_types/support.types";

interface ArticleFormProps {
  /** Present in edit mode; omit to create a new article. */
  initialData?: SupportArticleItem | null;
  /** Published resources from `GET /support/resources/options`. */
  resourceOptions: SupportResourceOption[];
  resourcesLoading?: boolean;
  /** Must reject on failure — the rejection is what surfaces the API's reason. */
  onSave: (payload: SupportArticlePayload) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
}

/** The API's own limits — checked here to save the round trip. */
const MIN_TITLE = 5;
const MAX_EXCERPT = 300;

/**
 * Validation keys paired with the element they belong to, in page order — so
 * a failed submit can jump to the first thing that needs fixing.
 */
const ERROR_FIELD_IDS: [string, string][] = [
  ["title", "article-form-title"],
  ["supportResourcesId", "article-form-resource"],
  ["excerpt", "article-form-excerpt"],
  ["content", "article-form-content"],
];

/** An editor left blank still holds markup like `<p></p>`. */
function isBlankHtml(html: string): boolean {
  return !html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export default function ArticleForm({
  initialData,
  resourceOptions,
  resourcesLoading = false,
  onSave,
  saving = false,
}: ArticleFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const initialResourceId = initialData ? resourceRefId(initialData) : "";

  // Field names match the API body, so this state object is (almost) the
  // payload — `slug` is absent because the server derives it from the title.
  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    supportResourcesId: initialResourceId,
    status: (initialData?.status ?? "draft") as SupportStatus,
    excerpt: initialData?.excerpt ?? "",
    tags: initialData?.tags ?? ([] as string[]),
    content: initialData?.content ?? "",
  });

  const [tagDraft, setTagDraft] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // The options list only holds published resources. An article filed under
  // one that has since been unpublished keeps showing it, so the picker never
  // renders a blank for the value it actually holds.
  const selectOptions = useMemo(() => {
    const title = initialData ? resourceRefTitle(initialData) : "";
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
  }, [resourceOptions, initialData, initialResourceId]);

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
    const title = formData.title.trim();
    const excerpt = formData.excerpt.trim();

    if (!title) next.title = "Title is required";
    else if (title.length < MIN_TITLE)
      next.title = `Title must be at least ${MIN_TITLE} characters`;

    if (!formData.supportResourcesId)
      next.supportResourcesId = "Pick the resource this article belongs to";

    if (!excerpt) next.excerpt = "Excerpt is required";
    else if (excerpt.length > MAX_EXCERPT)
      next.excerpt = `Excerpt cannot exceed ${MAX_EXCERPT} characters`;

    if (isBlankHtml(formData.content)) next.content = "Content is required";

    setErrors(next);
    return next;
  };

  /** Puts the first failing field on screen — the form is several screens tall. */
  const revealFirstError = (errs: Record<string, string>) => {
    const first = ERROR_FIELD_IDS.find(([key]) => errs[key]);
    if (!first) return;
    const el = document.getElementById(first[1]);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
      el.focus({ preventScroll: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      revealFirstError(errs);
      toast.error("Please fill in the highlighted fields.");
      return;
    }

    const title = formData.title.trim();

    const payload: SupportArticlePayload = {
      title,
      supportResourcesId: formData.supportResourcesId,
      status: formData.status,
      excerpt: formData.excerpt.trim(),
      tags: formData.tags,
      content: formData.content,
    };

    try {
      await onSave(payload);
      toast.success(
        isEdit
          ? `Article "${title}" updated successfully`
          : `Article "${title}" created successfully`,
      );
      router.push("/support/article");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        isEdit
          ? "Could not update the article. Please try again."
          : "Could not create the article. Please try again.",
      );

      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, title: message }));
      }

      toast.error(message);
    }
  };

  const excerptLength = formData.excerpt.trim().length;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left — content */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-card rounded-lg border border-border/50">
            <h2 className="bg-border/20 p-3 font-semibold text-foreground rounded-t-lg">
              Article Details
            </h2>
            <div className="p-3 sm:p-5 space-y-4">
              <Field>
                <FieldLabel htmlFor="article-form-title">
                  Title
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="article-form-title"
                  name="title"
                  placeholder="e.g. How to Contact the Support Team"
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
                <FieldLabel htmlFor="article-form-excerpt">
                  Excerpt
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Textarea
                  id="article-form-excerpt"
                  name="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="A short summary shown in search results and article lists..."
                  invalid={!!errors.excerpt}
                  className="bg-transparent"
                />
                {errors.excerpt ? (
                  <FieldError>{errors.excerpt}</FieldError>
                ) : (
                  <p
                    className={`text-xs text-right ${
                      excerptLength > MAX_EXCERPT
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {excerptLength}/{MAX_EXCERPT}
                  </p>
                )}
              </Field>
            </div>
          </div>

          <div
            id="article-form-content"
            className={`bg-card rounded-lg border ${
              errors.content ? "border-destructive" : "border-border/50"
            }`}
          >
            <h2 className="bg-border/20 p-3 font-semibold text-foreground rounded-t-lg">
              Content
              <span className="text-destructive" aria-hidden="true">
                {" "}
                *
              </span>
            </h2>
            <div className="p-3 sm:p-5 space-y-2">
              <TextEditor
                value={formData.content}
                onChange={(val) => set("content", val)}
                placeholder="Start writing your article..."
              />
              {errors.content && <FieldError>{errors.content}</FieldError>}
            </div>
          </div>
        </div>

        {/* Right — filing and publishing */}
        <div className="space-y-5">
          <div className="bg-card rounded-lg border border-border/50">
            <h2 className="bg-border/20 p-3 font-semibold text-foreground rounded-t-lg">
              Publishing
            </h2>
            <div className="p-3 sm:p-5 space-y-4">
              <Field>
                <FieldLabel htmlFor="article-form-resource">
                  Resource
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <SearchSelect
                  // SearchSelect only reads `value` on mount — keyed on the
                  // list so the label appears once the options arrive.
                  key={selectOptions.length}
                  id="article-form-resource"
                  fullWidth
                  className="w-full"
                  options={selectOptions}
                  value={formData.supportResourcesId}
                  placeholder={
                    resourcesLoading
                      ? "Loading resources…"
                      : "Select a resource"
                  }
                  searchPlaceholder="Search resources..."
                  error={errors.supportResourcesId}
                  disabled={resourcesLoading && selectOptions.length === 0}
                  onValueChange={(val) => set("supportResourcesId", val)}
                />
                {errors.supportResourcesId ? (
                  <FieldError>{errors.supportResourcesId}</FieldError>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {!resourcesLoading && selectOptions.length === 0
                      ? "No published resources yet — publish one on the Resource page first."
                      : "Only published resources are listed."}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel
                  id="article-form-status-label"
                  htmlFor="article-form-status"
                >
                  Status
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Select
                  id="article-form-status"
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
                <p className="text-xs text-muted-foreground">
                  Only published articles appear in the help centre.
                </p>
              </Field>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border/50">
            <h2 className="bg-border/20 p-3 font-semibold text-foreground rounded-t-lg">
              Tags
            </h2>
            <div className="p-3 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  id="article-form-tags"
                  name="tags"
                  placeholder="e.g. billing, refund"
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
                  className="bg-transparent flex-1"
                />
                {/* Blocking the mousedown keeps the input from blurring,
                    which would commit the tag before the click lands. */}
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
              {formData.tags.length > 0 ? (
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
              ) : (
                <p className="text-xs text-muted-foreground">
                  Press Enter or comma to add. Tags help search find this
                  article.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 px-6 text-muted-foreground"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-10 px-7"
          loading={saving}
          loadingText="Saving..."
        >
          {isEdit ? "Save Changes" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}
