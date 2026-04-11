"use client";

import { useEffect, useState } from "react";
import {
  SupportLearningVideo,
  SupportResource,
} from "../../_types/support.types";
import {
  X,
  PlayCircle,
  Eye,
  Clock,
  ExternalLink,
  DoorClosed,
} from "lucide-react";
import { format } from "date-fns";

interface VideoViewDrawerProps {
  video: SupportLearningVideo;
  resource?: SupportResource;
  onClose: () => void;
  onEdit?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
};

export default function VideoViewDrawer({
  video,
  resource,
  onClose,
  onEdit,
}: VideoViewDrawerProps) {
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
        aria-label="View Video"
        className="fixed top-0 right-0 z-500 h-full w-full max-w-[560px] flex flex-col bg-white dark:bg-darkBg border-l border-border/60 dark:border-darkBorder/60 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50 dark:border-darkBorder/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 shrink-0">
              <PlayCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black dark:text-white flex items-center gap-2 flex-wrap">
                {video.title}
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[video.status]}`}
                >
                  {video.status}
                </span>
              </h2>
              <p className="text-xs text-text5 mt-0.5">Learning Video</p>
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
          {/* Thumbnail */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-darkBorder group">
            {video.thumbnailUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <PlayCircle className="w-8 h-8 text-rose-600 ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text5 gap-2">
                <PlayCircle className="w-8 h-8" />
                <span>No Thumbnail</span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <Eye className="w-4 h-4 text-primary dark:text-blue-400" />
              <p className="text-sm font-bold text-black dark:text-white">
                {video.views.toLocaleString()}
              </p>
              <span className="text-[10px] text-text5">Views</span>
            </div>
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-bold text-black dark:text-white">
                {video.duration || "—"}
              </p>
              <span className="text-[10px] text-text5">Duration</span>
            </div>
            <div className="p-3 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30 flex flex-col items-center gap-1">
              <DoorClosed className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-semibold text-black dark:text-white text-center truncate w-full">
                {resource?.name ?? "—"}
              </p>
              <span className="text-[10px] text-text5">Resource</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-black dark:text-white bg-gray-50 dark:bg-darkPrimary/20 px-4 py-3 rounded-lg border border-border/50 dark:border-darkBorder/40">
              {video.description || "—"}
            </p>
          </div>

          {/* Video link */}
          {video.videoUrl && (
            <div>
              <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
                Video Link
              </h3>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary dark:text-blue-400 hover:underline bg-primary/5 dark:bg-primary/10 px-4 py-3 rounded-lg border border-primary/20 dark:border-primary/20 truncate"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span className="truncate">{video.videoUrl}</span>
              </a>
            </div>
          )}

          {/* Tags */}
          {video.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
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

          {/* Date */}
          <div className="px-4 py-4 rounded-lg border border-border/50 dark:border-darkBorder/40 bg-gray-50 dark:bg-darkPrimary/20">
            <span className="text-[11px] font-medium text-text5 uppercase block mb-1">
              Added On
            </span>
            <p className="text-sm text-black dark:text-white">
              {format(new Date(video.createdAt), "dd MMM yyyy")}
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
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            Watch Video
          </a>
          {onEdit && (
            <button
              onClick={() => {
                handleClose();
                setTimeout(onEdit, 300);
              }}
              className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Edit Video
            </button>
          )}
        </div>
      </div>
    </>
  );
}
