"use client";

import { useEffect, useState } from "react";
import { SupportChatbotQnA, SupportResource } from "../../_types/support.types";
import { X, MessageCircle, DoorClosed, ListOrdered, Hash } from "lucide-react";
import { format } from "date-fns";

interface ChatbotViewDrawerProps {
  qna: SupportChatbotQnA;
  resource?: SupportResource;
  onClose: () => void;
  onEdit?: () => void;
}

export default function ChatbotViewDrawer({
  qna,
  resource,
  onClose,
  onEdit,
}: ChatbotViewDrawerProps) {
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
        aria-label="View Q&A"
        className="fixed top-0 right-0 z-500 h-full w-full max-w-[520px] flex flex-col bg-white dark:bg-darkBg border-l border-border/60 dark:border-darkBorder/60 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50 dark:border-darkBorder/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 shrink-0">
              <MessageCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black dark:text-white flex items-center gap-2">
                Q&A Details
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    qna.isActive
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                  }`}
                >
                  {qna.isActive ? "Active" : "Inactive"}
                </span>
              </h2>
              <p className="text-xs text-text5 mt-0.5">Chatbot Q&A Entry</p>
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
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Meta row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <DoorClosed className="w-4 h-4 text-primary dark:text-blue-400" />
              <p className="text-xs font-semibold text-black dark:text-white text-center truncate w-full">
                {resource?.name ?? "—"}
              </p>
              <span className="text-[10px] text-text5">Resource</span>
            </div>
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <ListOrdered className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-black dark:text-white">
                #{qna.priority}
              </span>
              <span className="text-[10px] text-text5">Priority</span>
            </div>
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <Hash className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-black dark:text-white">
                {qna.keywords.length}
              </span>
              <span className="text-[10px] text-text5">Keywords</span>
            </div>
          </div>

          {/* Chat preview */}
          <div className="space-y-3">
            {/* User bubble */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
                {qna.question}
              </div>
            </div>
            {/* Bot bubble */}
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="max-w-[85%] bg-gray-100 dark:bg-darkPrimary/40 text-black dark:text-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                {qna.answer}
              </div>
            </div>
          </div>

          {/* Keywords */}
          {qna.keywords.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
                Trigger Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {qna.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-blue-400"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="px-4 py-4 rounded-lg border border-border/50 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkPrimary/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                  Created
                </span>
                <p className="text-sm text-black dark:text-white">
                  {format(new Date(qna.createdAt), "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
                  Last Updated
                </span>
                <p className="text-sm text-black dark:text-white">
                  {format(new Date(qna.updatedAt), "dd MMM yyyy")}
                </p>
              </div>
            </div>
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
              Edit Q&A
            </button>
          )}
        </div>
      </div>
    </>
  );
}
