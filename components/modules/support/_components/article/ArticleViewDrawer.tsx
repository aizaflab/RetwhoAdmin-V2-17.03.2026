"use client";

import { useEffect, useState } from "react";
import { SupportArticle, SupportResource } from "../../_types/support.types";
import { X, FileText, ThumbsUp, Eye } from "lucide-react";
import { format } from "date-fns";

interface ArticleViewDrawerProps {
  article: SupportArticle;
  resource?: SupportResource;
  onClose: () => void;
  onEdit?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  archived:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
};

export default function ArticleViewDrawer({
  article,
  resource,
  onClose,
  onEdit,
}: ArticleViewDrawerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-500 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="View Article"
        className="fixed top-0 right-0 z-500 h-full w-full max-w-[560px] flex flex-col bg-white dark:bg-darkBg border-l border-border/60 dark:border-darkBorder/60 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50 dark:border-darkBorder/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 shrink-0">
              <FileText className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black dark:text-white flex items-center gap-2 flex-wrap">
                {article.title}
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[article.status]}`}
                >
                  {article.status}
                </span>
              </h2>
              <p className="text-xs text-text5 mt-0.5">Article Details</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text5 hover:text-black dark:hover:text-white hover:border-primary/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <Eye className="w-4 h-4 text-primary dark:text-blue-400" />
              <p className="text-sm font-bold text-black dark:text-white">
                {article.views.toLocaleString()}
              </p>
              <span className="text-[10px] text-text5">Views</span>
            </div>
            <div className="p-3 rounded-xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <ThumbsUp className="w-4 h-4 text-emerald-500" />
              <p className="text-sm font-bold text-black dark:text-white">
                {article.helpful}
              </p>
              <span className="text-[10px] text-text5">Helpful</span>
            </div>
            <div className="p-3 rounded-xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <span className="text-lg">{resource?.icon ?? "📄"}</span>
              <p className="text-xs font-semibold text-black dark:text-white text-center truncate w-full text-center">
                {resource?.name ?? "—"}
              </p>
              <span className="text-[10px] text-text5">Resource</span>
            </div>
          </div>

          {/* Meta */}
          <div className="px-4 py-4 rounded-xl border border-border/50 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkPrimary/20 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                  Slug
                </span>
                <p className="text-sm text-black dark:text-white font-mono">
                  /{article.slug}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                  Created
                </span>
                <p className="text-sm text-black dark:text-white">
                  {format(new Date(article.createdAt), "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                  Last Updated
                </span>
                <p className="text-sm text-black dark:text-white">
                  {format(new Date(article.updatedAt), "dd MMM yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
              Excerpt
            </h3>
            <p className="text-sm text-black dark:text-white bg-gray-50 dark:bg-darkPrimary/20 px-4 py-3 rounded-xl border border-border/50 dark:border-darkBorder/40">
              {article.excerpt || "—"}
            </p>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content Preview */}
          <div>
            <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
              Content Preview
            </h3>
            <div
              className="px-4 py-4 rounded-xl border border-border/50 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkPrimary/20 prose dark:prose-invert text-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: article.content || "<p>No content yet.</p>",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-5 pt-4 pb-5 border-t border-border/50 dark:border-darkBorder/30 bg-gray-50/50 dark:bg-darkPrimary/20 flex gap-3 shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 py-2 rounded-lg border border-border/60 dark:border-darkBorder/60 bg-white dark:bg-darkBg text-sm font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-darkBorder/40 transition-colors cursor-pointer"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                handleClose();
                setTimeout(onEdit, 300);
              }}
              className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Edit Article
            </button>
          )}
        </div>
      </div>
    </>
  );
}
