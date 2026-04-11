"use client";

import { useEffect, useState } from "react";
import { ContactRequest } from "../../_types/setting.types";
import { format } from "date-fns";
import {
  X,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Tag,
  User,
  Reply,
} from "lucide-react";

interface ContactViewDrawerProps {
  contact: ContactRequest;
  onClose: () => void;
  onReply?: () => void;
}

const STATUS_CONFIG: Record<
  ContactRequest["status"],
  { label: string; className: string }
> = {
  unread: {
    label: "Unread",
    className:
      "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  },
  read: {
    label: "Read",
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
  replied: {
    label: "Replied",
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  archived: {
    label: "Archived",
    className:
      "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
  },
};

export default function ContactViewDrawer({
  contact,
  onClose,
  onReply,
}: ContactViewDrawerProps) {
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

  const statusCfg = STATUS_CONFIG[contact.status];

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
        aria-label="View Contact Request"
        className="fixed top-0 right-0 z-500 h-full w-full max-w-[540px] flex flex-col bg-white dark:bg-darkBg border-l border-border/60 dark:border-darkBorder/60 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50 dark:border-darkBorder/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
              <MessageSquare className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black dark:text-white flex items-center gap-2">
                Contact Request
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.className}`}
                >
                  {statusCfg.label}
                </span>
              </h2>
              <p className="text-xs text-text5 mt-0.5">
                {format(new Date(contact.createdAt), "dd MMM yyyy, hh:mm a")}
              </p>
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
          {/* Sender Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1 col-span-1">
              <User className="w-4 h-4 text-primary dark:text-blue-400" />
              <p className="text-xs font-semibold text-black dark:text-white text-center truncate w-full">
                {contact.fullName}
              </p>
              <span className="text-[10px] text-text5">Sender</span>
            </div>
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1 col-span-1">
              <Mail className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-semibold text-black dark:text-white text-center truncate w-full">
                {contact.email.split("@")[0]}
              </p>
              <span className="text-[10px] text-text5">Email</span>
            </div>
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1 col-span-1">
              <Phone className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-semibold text-black dark:text-white text-center truncate w-full">
                {contact.phone ? "Yes" : "N/A"}
              </p>
              <span className="text-[10px] text-text5">Phone</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="px-4 py-4 rounded-lg border border-border/50 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkPrimary/20 space-y-3">
            <div>
              <span className="text-[11px] font-medium text-text5 uppercase tracking-wider block mb-1">
                Full Name
              </span>
              <p className="text-sm font-medium text-black dark:text-white">
                {contact.fullName}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-medium text-text5 uppercase tracking-wider block mb-1">
                  Email Address
                </span>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-primary dark:text-blue-400 hover:underline break-all"
                >
                  {contact.email}
                </a>
              </div>
              {contact.phone && (
                <div>
                  <span className="text-[11px] font-medium text-text5 uppercase tracking-wider block mb-1">
                    Phone Number
                  </span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm text-black dark:text-white hover:text-primary dark:hover:text-blue-400 transition-colors"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Subject
            </h3>
            <p className="text-sm font-semibold text-black dark:text-white bg-gray-50 dark:bg-darkPrimary/20 px-4 py-3 rounded-lg border border-border/50 dark:border-darkBorder/40">
              {contact.subject}
            </p>
          </div>

          {/* Message */}
          <div>
            <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </h3>
            <div className="bg-gray-50 dark:bg-darkPrimary/20 px-4 py-4 rounded-lg border border-border/50 dark:border-darkBorder/40">
              <p className="text-sm text-black dark:text-white leading-relaxed whitespace-pre-wrap">
                {contact.message}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="px-4 py-4 rounded-lg border border-border/50 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkPrimary/20">
            <div className="flex items-center gap-2 text-[11px] font-medium text-text5 uppercase mb-1">
              <Clock className="w-3 h-3" />
              Received At
            </div>
            <p className="text-sm text-black dark:text-white">
              {format(
                new Date(contact.createdAt),
                "EEEE, dd MMMM yyyy — hh:mm a",
              )}
            </p>
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
          {onReply && (
            <button
              onClick={() => {
                handleClose();
                setTimeout(onReply, 300);
              }}
              className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Reply className="w-4 h-4" />
              Reply via Email
            </button>
          )}
        </div>
      </div>
    </>
  );
}
