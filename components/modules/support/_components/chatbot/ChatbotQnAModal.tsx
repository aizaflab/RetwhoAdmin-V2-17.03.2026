"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PlusIcon, XIcon } from "lucide-react";
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
  CHATBOT_PRIORITY_OPTIONS,
  SUPPORT_STATUS_OPTIONS,
  resourceRefId,
  resourceRefTitle,
} from "../../_data/support-options";
import type {
  SupportChatbotItem,
  SupportChatbotPayload,
  SupportResourceOption,
  SupportStatus,
} from "../../_types/support.types";

interface ChatbotQnAModalProps {
  /** Present in edit mode; null to create a new answer. */
  qna: SupportChatbotItem | null;
  /** Published resources from `GET /support/resources/options`. */
  resourceOptions: SupportResourceOption[];
  resourcesLoading?: boolean;
  onClose: () => void;
  /**
   * Must reject on failure — the rejection is what surfaces the API's reason.
   * Partial on edit: an unchanged resource is left out (see `handleSubmit`).
   */
  onSave: (
    payload: SupportChatbotPayload | Partial<SupportChatbotPayload>,
    id?: string,
  ) => Promise<unknown>;
  saving?: boolean;
}

/** The API's own limit — checked here to save the round trip. */
const MAX_EXCERPT = 255;

export default function ChatbotQnAModal({
  qna,
  resourceOptions,
  resourcesLoading = false,
  onClose,
  onSave,
  saving = false,
}: ChatbotQnAModalProps) {
  const initialResourceId = qna ? resourceRefId(qna) : "";

  // Field names match the API body, so this state object is the payload.
  const [formData, setFormData] = useState({
    question: qna?.question ?? "",
    answer: qna?.answer ?? "",
    supportResourcesId: initialResourceId,
    priority: qna?.priority ?? "medium",
    status: (qna?.status ?? "draft") as SupportStatus,
    excerpt: qna?.excerpt ?? "",
    tags: qna?.tags ?? ([] as string[]),
  });

  const [tagDraft, setTagDraft] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Only published resources are offered. One the answer already sits under
  // but that has since been unpublished is kept, so the picker never blanks.
  const selectOptions = useMemo(() => {
    const title = qna ? resourceRefTitle(qna) : "";
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
  }, [resourceOptions, qna, initialResourceId]);

  // A priority stored as something other than high/medium/low still shows.
  const priorityOptions = useMemo(
    () =>
      CHATBOT_PRIORITY_OPTIONS.some((o) => o.value === formData.priority)
        ? CHATBOT_PRIORITY_OPTIONS
        : [
            ...CHATBOT_PRIORITY_OPTIONS,
            { label: formData.priority, value: formData.priority },
          ],
    [formData.priority],
  );

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

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.question.trim()) next.question = "Question is required";
    if (!formData.answer.trim()) next.answer = "Answer is required";
    if (!formData.supportResourcesId)
      next.supportResourcesId = "Pick the resource this answer belongs to";
    if (formData.excerpt.trim().length > MAX_EXCERPT)
      next.excerpt = `Excerpt cannot exceed ${MAX_EXCERPT} characters`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in the highlighted fields.");
      return;
    }

    const excerpt = formData.excerpt.trim();
    const payload: SupportChatbotPayload = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      supportResourcesId: formData.supportResourcesId,
      priority: formData.priority,
      status: formData.status,
      tags: formData.tags,
      ...(excerpt || qna ? { excerpt } : {}),
    };

    // The API re-checks that a sent resource is published. Leaving an
    // unchanged one out lets an answer under a since-unpublished resource
    // still be edited.
    const { supportResourcesId, ...rest } = payload;
    const body =
      qna && supportResourcesId === initialResourceId ? rest : payload;

    try {
      await onSave(body, qna?._id);
      toast.success(
        qna ? "Q&A updated successfully" : "Q&A created successfully",
      );
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        qna
          ? "Could not update the Q&A. Please try again."
          : "Could not create the Q&A. Please try again.",
      );

      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, question: message }));
      }

      toast.error(message);
    }
  };

  const excerptLength = formData.excerpt.trim().length;

  return (
    <Dialog
      open
      onClose={onClose}
      title={qna ? "Edit Q&A" : "Add Q&A"}
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
            form="chatbot-form"
            className="flex-1 h-10"
            loading={saving}
            loadingText="Saving..."
          >
            {qna ? "Save Changes" : "Create Q&A"}
          </Button>
        </div>
      }
    >
      <form
        id="chatbot-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Field>
          <FieldLabel htmlFor="qna-question">
            Question
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Textarea
            id="qna-question"
            name="question"
            rows={2}
            value={formData.question}
            onChange={(e) => set("question", e.target.value)}
            placeholder="e.g. How can I reset my password?"
            invalid={!!errors.question}
            className="bg-transparent"
          />
          {errors.question && <FieldError>{errors.question}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="qna-answer">
            Answer
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Textarea
            id="qna-answer"
            name="answer"
            rows={5}
            value={formData.answer}
            onChange={(e) => set("answer", e.target.value)}
            placeholder="The reply the chatbot gives — clear and to the point..."
            invalid={!!errors.answer}
            className="bg-transparent"
          />
          {errors.answer && <FieldError>{errors.answer}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="qna-resource">
            Resource
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <SearchSelect
            // SearchSelect only reads `value` on mount — keyed on the list so
            // the label appears once the options arrive.
            key={selectOptions.length}
            id="qna-resource"
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
            <p className="text-xs text-muted-foreground">
              {!resourcesLoading && selectOptions.length === 0
                ? "No published resources yet — publish one on the Resource page first."
                : "Only published resources are listed."}
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel id="qna-priority-label" htmlFor="qna-priority">
              Priority
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <Select
              id="qna-priority"
              value={formData.priority}
              onValueChange={(val) => set("priority", val)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Select priority"
                  options={priorityOptions}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={priorityOptions} />
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel id="qna-status-label" htmlFor="qna-status">
              Status
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <Select
              id="qna-status"
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

        <Field>
          <FieldLabel htmlFor="qna-excerpt">
            Excerpt{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <Input
            id="qna-excerpt"
            name="excerpt"
            value={formData.excerpt}
            onValueChange={(val) => set("excerpt", val)}
            placeholder="e.g. Quick guide to reset your password"
            aria-invalid={errors.excerpt ? true : undefined}
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

        <Field>
          <FieldLabel htmlFor="qna-tags">
            Tags{" "}
            <span className="text-xs font-normal text-muted-foreground">
              press Enter or Add
            </span>
          </FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="qna-tags"
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
              placeholder="e.g. password, login"
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
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
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
        </Field>
      </form>
    </Dialog>
  );
}
