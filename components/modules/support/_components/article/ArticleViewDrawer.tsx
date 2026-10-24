"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { Button } from "@/components/ui/button/Button";
import { useGetSupportArticleQuery } from "@/featured/support/supportApiSlice";
import { sanitizeHtml } from "@/lib/sanitize";

import {
  resourceRefTitle,
  supportStatusStyle,
} from "../../_data/support-options";
import type { SupportArticleItem } from "../../_types/support.types";

interface ArticleViewDrawerProps {
  open: boolean;
  article?: SupportArticleItem | null;
  onClose: () => void;
  onEdit?: (article: SupportArticleItem) => void;
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

/** Read-only article detail, refreshed from `GET /support/articles/:id`. */
export default function ArticleViewDrawer({
  open,
  article,
  onClose,
  onEdit,
}: ArticleViewDrawerProps) {
  // The caller clears its selection the moment the drawer closes. Hold on to
  // the last article so the panel still has content while it slides out.
  const [lastArticle, setLastArticle] = useState(article);
  if (article && article !== lastArticle) setLastArticle(article);

  const row = article ?? lastArticle;

  // The list row renders straight away; the single fetch swaps in the latest
  // copy in case it changed since the list loaded.
  const { data: fresh } = useGetSupportArticleQuery(row?._id ?? "", {
    skip: !open || !row?._id,
  });

  const shown = fresh && fresh._id === row?._id ? fresh : row;
  if (!shown) return null;

  const resourceTitle = resourceRefTitle(shown);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-semibold text-foreground">
                {shown.title}
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
            <Button onClick={() => onEdit(shown)}>Edit Article</Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Resource" value={resourceTitle || "—"} />
          <DetailRow
            label="Published"
            value={
              shown.publishedAt
                ? formatDate(shown.publishedAt)
                : "Not published yet"
            }
          />
          <DetailRow label="Created" value={formatDate(shown.createdAt)} />
          <DetailRow label="Last Updated" value={formatDate(shown.updatedAt)} />
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Excerpt
          </h3>
          <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-foreground">
            {shown.excerpt || "—"}
          </p>
        </div>

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

        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Content
          </h3>
          <div
            className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border bg-muted/30 px-4 py-4 text-foreground"
            // Authored HTML from the editor — sanitised before it renders.
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(shown.content || "<p>No content yet.</p>"),
            }}
          />
        </div>
      </div>
    </Drawer>
  );
}
