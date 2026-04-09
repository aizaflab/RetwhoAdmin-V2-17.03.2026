"use client";

import { useState } from "react";
import { SupportChatbotQnA, SupportResource } from "../../_types/support.types";
import { Input, Modal } from "@/components/ui";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { X } from "lucide-react";

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
    label: `${r.icon} ${r.name}`,
  }));

  return (
    <Modal
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
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={String(formData.priority)}
            onValueChange={(val) =>
              setFormData((p) => ({ ...p, priority: Number(val) }))
            }
            className="w-full dark:border-darkBorder"
          />
        </div>

        {/* Question */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#344054] dark:text-gray-100">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={formData.question}
            onChange={(e) => {
              setFormData((p) => ({ ...p, question: e.target.value }));
              if (errors.question) setErrors((p) => ({ ...p, question: "" }));
            }}
            placeholder="e.g. How do I reset my password?"
            className={`w-full rounded-md border p-3 text-sm bg-white dark:bg-darkBg outline-none focus:border-gray-400 placeholder:text-gray-400 dark:text-white resize-none transition-colors ${
              errors.question
                ? "border-red-500"
                : "border-border dark:border-darkBorder dark:focus:border-primary"
            }`}
          />
          {errors.question && (
            <p className="text-xs text-red-500">{errors.question}</p>
          )}
        </div>

        {/* Answer */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#344054] dark:text-gray-100">
            Answer <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            value={formData.answer}
            onChange={(e) => {
              setFormData((p) => ({ ...p, answer: e.target.value }));
              if (errors.answer) setErrors((p) => ({ ...p, answer: "" }));
            }}
            placeholder="Provide a clear, helpful answer..."
            className={`w-full rounded-md border p-3 text-sm bg-white dark:bg-darkBg outline-none focus:border-gray-400 placeholder:text-gray-400 dark:text-white resize-y transition-colors ${
              errors.answer
                ? "border-red-500"
                : "border-border dark:border-darkBorder dark:focus:border-primary"
            }`}
          />
          {errors.answer && (
            <p className="text-xs text-red-500">{errors.answer}</p>
          )}
        </div>

        {/* Keywords */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#344054] dark:text-gray-100">
            Keywords{" "}
            <span className="text-text5 font-normal">(for matching)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              placeholder="Type keyword & press Enter"
              className="flex-1 rounded-md border border-border dark:border-darkBorder px-3 py-2 text-sm bg-white dark:bg-darkBg outline-none focus:border-gray-400 dark:focus:border-primary placeholder:text-gray-400 dark:text-white"
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
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-blue-400"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div>
            <p className="text-sm font-medium text-black dark:text-white">
              Active Status
            </p>
            <p className="text-xs text-text5">
              Inactive Q&As will not appear in chatbot responses
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData((p) => ({ ...p, isActive: !p.isActive }))
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer ${
              formData.isActive
                ? "bg-primary"
                : "bg-gray-300 dark:bg-darkBorder"
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
    </Modal>
  );
}
