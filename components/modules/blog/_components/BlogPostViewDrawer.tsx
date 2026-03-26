"use client";

import { useEffect, useState } from "react";
import { BlogPost, BlogCategory } from "../_types/blog.types";
import { X, FileText, Image as ImageIcon } from "lucide-react";

interface BlogPostViewDrawerProps {
  post: BlogPost;
  category?: BlogCategory;
  onClose: () => void;
  onEdit?: () => void;
}

const STATUS_STYLES = {
  published:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  archived:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
};

export default function BlogPostViewDrawer({
  post,
  category,
  onClose,
  onEdit,
}: BlogPostViewDrawerProps) {
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
      <div
        onClick={handleClose}
        className="fixed inset-0 z-500 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="View Post"
        className="fixed top-0 right-0 z-500 h-full w-full max-w-[550px]
                   flex flex-col
                   bg-white dark:bg-darkBg
                   border-l border-border/60 dark:border-darkBorder/60
                   shadow-2xl
                   transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50 dark:border-darkBorder/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 shrink-0">
              <FileText className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black dark:text-white flex items-center gap-2">
                {post.title}
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[post.status]}`}
                >
                  {post.status}
                </span>
              </h2>
              <p className="text-xs text-text5 mt-0.5">Post Details</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text5 hover:text-black dark:hover:text-white hover:border-primary/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-gray-100 dark:bg-darkBorder">
            {post.bannerImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.bannerImage}
                alt={post.altText}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text5 gap-2">
                <ImageIcon className="w-6 h-6" />
                <span>No Banner Image</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white font-medium truncate">{post.title}</h3>
              <p className="text-white/80 text-xs">/{post.slug}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30">
              <span className="text-xs font-medium text-text5 block mb-1">
                Category
              </span>
              <p className="font-semibold text-black dark:text-white">
                {category?.name || "Unknown"}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30">
              <span className="text-xs font-medium text-text5 block mb-1">
                Total Views
              </span>
              <p className="font-semibold text-black dark:text-white mt-2">
                {post.views.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
              SEO Information
            </h3>
            <div className="px-4 py-4 rounded-xl border border-border/50 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkPrimary/20 space-y-3">
              <div>
                <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                  Meta Title
                </span>
                <p className="text-sm font-medium text-black dark:text-white">
                  {post.metaTitle || "-"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                  Meta Description
                </span>
                <p className="text-sm text-black dark:text-white">
                  {post.metaDescription || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                    Image Alt
                  </span>
                  <p className="text-sm text-black dark:text-white">
                    {post.altText || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                    Image Title
                  </span>
                  <p className="text-sm text-black dark:text-white">
                    {post.imageTitle || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
              Content Preview
            </h3>
            <div
              className="px-4 py-4 rounded-xl border border-border/50 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkPrimary/20 prose dark:prose-invert text-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-auto px-5 pt-4 pb-5 border-t border-border/50 dark:border-darkBorder/30 bg-gray-50/50 dark:bg-darkPrimary/20 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2 rounded-lg border border-border/60 dark:border-darkBorder/60 bg-white dark:bg-darkBg text-sm font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-darkBorder/40 transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                handleClose();
                setTimeout(onEdit, 300);
              }}
              className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Edit Post
            </button>
          )}
        </div>
      </div>
    </>
  );
}
