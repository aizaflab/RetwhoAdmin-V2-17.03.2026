"use client";

import { useState } from "react";
import { Bot, MessageCircleQuestion } from "lucide-react";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { Button } from "@/components/ui/button/Button";
import { useGetSupportChatbotQuery } from "@/featured/support/supportApiSlice";

import {
  chatbotPriorityStyle,
  resourceRefTitle,
  supportStatusStyle,
} from "../../_data/support-options";
import type { SupportChatbotItem } from "../../_types/support.types";

interface ChatbotViewDrawerProps {
  open: boolean;
  qna?: SupportChatbotItem | null;
  onClose: () => void;
  onEdit?: (qna: SupportChatbotItem) => void;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm wrap-break-word text-foreground">{value}</span>
    </div>
  );
}

/** Read-only Q&A detail, refreshed from `GET /support/chatbots/:id`. */
export default function ChatbotViewDrawer({
  open,
  qna,
  onClose,
  onEdit,
}: ChatbotViewDrawerProps) {
  // The caller clears its selection the moment the drawer closes. Hold on to
  // the last entry so the panel still has content while it slides out.
  const [lastQna, setLastQna] = useState(qna);
  if (qna && qna !== lastQna) setLastQna(qna);

  const row = qna ?? lastQna;

  const { data: fresh } = useGetSupportChatbotQuery(row?._id ?? "", {
    skip: !open || !row?._id,
  });

  const shown = fresh && fresh._id === row?._id ? fresh : row;
  if (!shown) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <MessageCircleQuestion className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">
                Chatbot Q&amp;A
              </span>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${supportStatusStyle(
                  shown.status,
                )}`}
              >
                {shown.status}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs font-normal text-muted-foreground">
              /{shown.slug}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(shown)}>Edit Q&amp;A</Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Conversation preview — how the exchange reads to a shopper. */}
        <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              {shown.question}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="size-4 text-primary" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line text-foreground">
              {shown.answer}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Resource" value={resourceRefTitle(shown) || "—"} />
          <DetailRow
            label="Priority"
            value={
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium capitalize ${chatbotPriorityStyle(
                  shown.priority,
                )}`}
              >
                {shown.priority || "—"}
              </span>
            }
          />
          <DetailRow
            label="Published"
            value={
              shown.publishedAt
                ? formatDate(shown.publishedAt)
                : "Not published yet"
            }
          />
          <DetailRow label="Last Updated" value={formatDate(shown.updatedAt)} />
        </div>

        {shown.excerpt && (
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Excerpt
            </h3>
            <p className="text-sm leading-relaxed text-foreground">
              {shown.excerpt}
            </p>
          </div>
        )}

        {(shown.tags ?? []).length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {shown.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
