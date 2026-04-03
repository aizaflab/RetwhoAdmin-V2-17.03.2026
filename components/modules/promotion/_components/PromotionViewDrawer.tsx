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
  Award,
  ExternalLink,
  Info,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { useState, useEffect } from "react";

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
}: PromotionViewDrawerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <div
        onClick={handleClose}
        className="fixed inset-0 h-screen z-500 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-501 h-full w-full max-w-[420px]
                   flex flex-col
                   bg-white dark:bg-darkPrimary
                   border-l border-border/40 dark:border-white/5
                   shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.1)]
                   transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <div className="space-y-2">
            <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5">
              {promotion.bannerImage ? (
                <Image
                  src={promotion.bannerImage}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                  fill
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                  <Info className="w-6 h-6 opacity-30" />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border border-white/20 dark:border-white/10">
                  {TYPE_ICONS[promotion.adType]}
                  {promotion.adType}
                </div>
              </div>
            </div>

            <div>
              <span
                className={`text-[9px] font-medium px-2 py-0.5 rounded-full uppercase tracking-widest mb-1 ${STATUS_STYLES[promotion.status]}`}
              >
                {promotion.status}
              </span>

              <h1 className="text-xl mb-0.5 font-semibold text-black dark:text-white tracking-tight">
                {promotion.title}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                Managed by{" "}
                <span className="text-[#0284c7]">
                  {promotion.wholesalerName}
                </span>
              </p>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-darkBorder bg-gray-100 dark:bg-darkPrimary  rounded-md overflow-hidden border border-gray-100 dark:border-darkBorder">
            <div className="bg-white dark:bg-darkBorder/20 p-3 pl-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Target
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {promotion.targetAudience}
              </span>
            </div>
            <div className="bg-white dark:bg-darkBorder/20 p-3 pl-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Priority
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Grade {promotion.priority}
              </span>
            </div>
          </div>
          {/* start and end timeline */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-darkBorder bg-gray-100 dark:bg-darkPrimary  rounded-md overflow-hidden border border-gray-100 dark:border-darkBorder">
            <div className="bg-white dark:bg-darkBorder/20 p-3 pl-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Start
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {promotion.startDate
                  ? format(new Date(promotion.startDate), "MMM dd, yyyy")
                  : "ASAP"}
              </span>
            </div>
            <div className="bg-white dark:bg-darkBorder/20 p-3 pl-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                End
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {promotion.endDate
                  ? format(new Date(promotion.endDate), "MMM dd, yyyy")
                  : "Ongoing"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-[0.15em] border-b border-gray-100 dark:border-white/5 pb-2">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 font-normal italic">
              &ldquo;{promotion.shortDescription}&rdquo;
            </p>
          </div>

          {/* Link */}
          <a
            href={promotion.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 mt-7 rounded-md bg-gray-50 dark:bg-darkBorder/20 bborder border-gray-100 dark:border-darkBorder group hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#0284c7] transition-colors shadow-sm cursor-pointer">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Source Link
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[220px]">
                  {promotion.mediaUrl}
                </span>
              </div>
            </div>
            <Award className="w-4 h-4 text-gray-300 group-hover:text-amber-400 transition-colors" />
          </a>
        </div>
      </div>
    </>
  );
}
