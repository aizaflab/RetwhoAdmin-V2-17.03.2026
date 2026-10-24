"use client";

import { useState } from "react";
import { Clock, ExternalLink, PlayCircle } from "lucide-react";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { Button } from "@/components/ui/button/Button";
import { useGetSupportVideoQuery } from "@/featured/support/supportApiSlice";

import {
  parseVideoUrl,
  resourceRefTitle,
  supportStatusStyle,
} from "../../_data/support-options";
import type { SupportVideoItem } from "../../_types/support.types";

interface VideoViewDrawerProps {
  open: boolean;
  video?: SupportVideoItem | null;
  onClose: () => void;
  onEdit?: (video: SupportVideoItem) => void;
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

/** Plays the video where the source allows it, else shows the thumbnail. */
function VideoPlayer({ video }: { video: SupportVideoItem }) {
  const source = parseVideoUrl(video.videoUrl);

  if (source.kind === "youtube" || source.kind === "vimeo") {
    return (
      <iframe
        src={source.embedUrl}
        title={video.title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (source.kind === "file") {
    return (
      <video
        src={source.url}
        poster={video.thumbnailUrl || undefined}
        controls
        preload="metadata"
        className="h-full w-full bg-black"
      />
    );
  }

  // Not something the panel can embed — the thumbnail links out instead.
  return (
    <a
      href={video.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-full w-full"
    >
      {video.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover"
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/50">
        <PlayCircle className="size-12 text-white" />
      </span>
    </a>
  );
}

/** Read-only video detail, refreshed from `GET /support/videos/:id`. */
export default function VideoViewDrawer({
  open,
  video,
  onClose,
  onEdit,
}: VideoViewDrawerProps) {
  // The caller clears its selection the moment the drawer closes. Hold on to
  // the last video so the panel still has content while it slides out.
  const [lastVideo, setLastVideo] = useState(video);
  if (video && video !== lastVideo) setLastVideo(video);

  const row = video ?? lastVideo;

  const { data: fresh } = useGetSupportVideoQuery(row?._id ?? "", {
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
            <PlayCircle className="size-5 text-primary" />
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
          {onEdit && <Button onClick={() => onEdit(shown)}>Edit Video</Button>}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Only mounted while open, so closing the drawer stops playback. */}
        {open && (
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
            <VideoPlayer video={shown} />
          </div>
        )}

        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Description
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
            {shown.description || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Resource" value={resourceRefTitle(shown) || "—"} />
          <DetailRow
            label="Duration"
            value={
              shown.duration ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {shown.duration}
                </span>
              ) : (
                "—"
              )
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
          <div className="sm:col-span-2">
            <DetailRow
              label="Video URL"
              value={
                <a
                  href={shown.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 break-all text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5 shrink-0" />
                  {shown.videoUrl}
                </a>
              }
            />
          </div>
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
      </div>
    </Drawer>
  );
}
