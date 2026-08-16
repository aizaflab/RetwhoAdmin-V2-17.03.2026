"use client";

import { useState } from "react";
import { SupportChatbotQnA, SupportResource } from "../../_types/support.types";
import { Dialog, Field, FieldError, FieldLabel, Input } from "@/components/ui";
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

interface ChatbotQnAModalProps {
  qna: SupportChatbotQnA | null;
  resources: SupportResource[];
  onClose: () => void;
  onSave: (data: Partial<SupportChatbotQnA>) => void;
}

const PRIORITY_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `Priority ${i + 1}${i === 0 ? " (Highest)" : i === 9 ? " (Lowest)" : ""}`,
}));

export default function ChatbotQnAModal({
  qna,
  resources,
  onClose,
  onSave,
}: ChatbotQnAModalProps) {
  const blank = {
    question: "",
    answer: "",
    resourceId: resources[0]?.id ?? "",
    keywords: [] as string[],
    priority: 5,
    isActive: true,
  };

  const [formData, setFormData] = useState(
    qna
      ? {
          question: qna.question,
          answer: qna.answer,
          resourceId: qna.resourceId,
          keywords: qna.keywords,
          priority: qna.priority,
          isActive: qna.isActive,
        }
      : blank,
  );

  const [kwInput, setKwInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addKeyword = () => {
    const kw = kwInput.trim().toLowerCase();
    if (kw && !formData.keywords.includes(kw)) {
      setFormData((p) => ({ ...p, keywords: [...p.keywords, kw] }));
    }
    setKwInput("");
  };

  const removeKeyword = (kw: string) => {
    setFormData((p) => ({
      ...p,
      keywords: p.keywords.filter((k) => k !== kw),
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.question.trim()) e.question = "Question is required";
    if (!formData.answer.trim()) e.answer = "Answer is required";
    if (!formData.resourceId) e.resourceId = "Resource is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      id: qna?.id ?? `qna_${Date.now()}`,
      ...formData,
      createdAt: qna?.createdAt ?? new Date().toISOString(),
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
      title={qna ? "Edit Q&A" : "Add Q&A"}
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
          <Button type="submit" form="chatbot-form" className="flex-1 h-10">
            {qna ? "Save Changes" : "Create Q&A"}
          </Button>
        </div>
      }
    >
      <form id="chatbot-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Resource + Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel id="qna-resource-label" htmlFor="qna-resource">
              Resource Category
            </FieldLabel>
            <Select
              id="qna-resource"
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
            <FieldLabel id="qna-priority-label" htmlFor="qna-priority">
              Priority
            </FieldLabel>
            <Select
              id="qna-priority"
              value={String(formData.priority)}
              onValueChange={(val) =>
                setFormData((p) => ({ ...p, priority: Number(val) }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Select priority"
                  options={PRIORITY_OPTIONS}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={PRIORITY_OPTIONS} />
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Question */}
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
            onChange={(e) => {
              setFormData((p) => ({ ...p, question: e.target.value }));
              if (errors.question) setErrors((p) => ({ ...p, question: "" }));
            }}
            placeholder="e.g. How do I reset my password?"
            invalid={!!errors.question}
            className="bg-transparent"
          />
          {errors.question && <FieldError>{errors.question}</FieldError>}
        </Field>

        {/* Answer */}
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
            onChange={(e) => {
              setFormData((p) => ({ ...p, answer: e.target.value }));
              if (errors.answer) setErrors((p) => ({ ...p, answer: "" }));
            }}
            placeholder="Provide a clear, helpful answer..."
            invalid={!!errors.answer}
            className="bg-transparent"
          />
          {errors.answer && <FieldError>{errors.answer}</FieldError>}
        </Field>

        {/* Keywords */}
        <Field>
          <FieldLabel htmlFor="qna-keywords">
            Keywords
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <div className="flex items-end gap-3">
            <Input
              id="qna-keywords"
              name="keywords"
              value={kwInput}
              onValueChange={setKwInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              placeholder="Type keyword & press Enter"
              className="flex-1 bg-transparent"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 text-sm"
              onClick={addKeyword}
            >
              Add
            </Button>
          </div>

          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {formData.keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="hover:text-destructive transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
          <div>
            <p className="text-sm font-medium text-foreground">Active Status</p>
            <p className="text-xs text-muted-foreground">
              Inactive Q&As will not appear in chatbot responses
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData((p) => ({ ...p, isActive: !p.isActive }))
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer ${
              formData.isActive ? "bg-primary" : "bg-muted-foreground/40"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                formData.isActive ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </form>
    </Dialog>
  );
}
