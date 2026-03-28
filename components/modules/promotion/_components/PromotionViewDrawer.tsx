"use client";

import {
  Promotion,
  AdvertisementType,
  PromotionStatus,
} from "../_types/promotion.types";
import {
  X,
  Video,
  Headphones,
  FileText,
  Calendar,
  Target,
  Award,
  ExternalLink,
  Info,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";

interface PromotionViewDrawerProps {
  promotion: Promotion;
  onClose: () => void;
  onEdit?: () => void;
}

const STATUS_STYLES: Record<PromotionStatus, string> = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
  scheduled: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  expired: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
};

const TYPE_ICONS: Record<AdvertisementType, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  audio: <Headphones className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
};

export default function PromotionViewDrawer({
  promotion,
  onClose,
  onEdit,
}: PromotionViewDrawerProps) {
  const [visible, setVisible] = useState(false);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

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
        className="fixed top-0 right-0 z-501 h-full w-full max-w-[550px]
                   flex flex-col
                   bg-white dark:bg-darkBg
                   border-l border-border/60 dark:border-darkBorder/60
                   shadow-2xl
                   transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-border/50 dark:border-darkBorder/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#0284c7] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                {promotion.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${STATUS_STYLES[promotion.status]}`}
                >
                  {promotion.status}
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  By {promotion.wholesalerName}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-gray-400 hover:text-black dark:hover:text-white hover:border-blue-400/40 transition-all shadow-sm"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 custom-scrollbar">
          {/* Banner */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-darkBorder border border-border/50 shadow-sm">
            {promotion.bannerImage ? (
              <Image
                src={promotion.bannerImage}
                alt={promotion.title}
                className="w-full h-full object-cover"
                fill
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Info className="w-8 h-8 opacity-20" />
                <span className="text-sm font-medium">No Banner Image</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                {TYPE_ICONS[promotion.adType]}
                {promotion.adType} Advertisement
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-white/5 space-y-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Target className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Target Audience
                </span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white capitalize">
                {promotion.targetAudience}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-white/5 space-y-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Priority Level
                </span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white">
                Grade {promotion.priority} Promotion
              </p>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Calendar className="w-3.5 h-3.5" /> Campaign Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-center">
                  Start Date
                </span>
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 text-center">
                  {promotion.startDate
                    ? format(new Date(promotion.startDate), "MMMM dd, yyyy")
                    : "Immediately"}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-2xl bg-rose-50/30 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest text-center">
                  End Date
                </span>
                <span className="text-sm font-bold text-rose-800 dark:text-rose-300 text-center">
                  {promotion.endDate
                    ? format(new Date(promotion.endDate), "MMMM dd, yyyy")
                    : "Until Canceled"}
                </span>
              </div>
            </div>
          </div>

          {/* Media Link */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> Media Source
            </h3>
            <a
              href={promotion.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/30 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 group hover:border-[#0284c7]/30 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-white dark:bg-white/10 text-blue-500">
                  {TYPE_ICONS[promotion.adType]}
                </div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                  {promotion.mediaUrl}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
            </a>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
              Description
            </h3>
            <div className="p-5 rounded-2xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/30 dark:bg-white/5 text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">
              &ldquo;{promotion.shortDescription}&rdquo;
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-auto px-6 pt-5 pb-6 border-t border-border/50 dark:border-darkBorder/30 bg-gray-50/30 dark:bg-white/5 flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 h-11 rounded-xl border border-border/60 dark:border-darkBorder/60 bg-white dark:bg-darkBg text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            Return
          </button>
          {onEdit && (
            <button
              onClick={() => {
                handleClose();
                setTimeout(onEdit, 300);
              }}
              className="flex-[1.5] h-11 rounded-xl bg-[#0284c7] text-white text-sm font-bold hover:bg-[#0284c7]/90 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              Update Campaign
            </button>
          )}
        </div>
      </div>
    </>
  );
}
