import type { SelectOption } from "@/components/ui/select/Select";

import type {
  SupportArticleItem,
  SupportStatus,
} from "../_types/support.types";

export const SUPPORT_STATUS_OPTIONS: SelectOption[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export const SUPPORT_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...SUPPORT_STATUS_OPTIONS,
];

/* Tinted from the semantic tokens so both themes resolve from one source. */
const STATUS_STYLES: Record<SupportStatus, string> = {
  published: "bg-success/10 text-success",
  draft: "bg-warning/10 text-warning",
  archived: "bg-muted text-muted-foreground",
};

export function supportStatusStyle(status?: string): string {
  return (
    STATUS_STYLES[status as SupportStatus] ?? "bg-muted text-muted-foreground"
  );
}

/** Anything filed under a resource — articles, chatbot answers, videos. */
type ResourceLinked = Pick<SupportArticleItem, "supportResourcesId">;

/** Reads list rows (populated) and mutation responses (bare id) alike. */
export function resourceRefId(item: ResourceLinked): string {
  const ref = item.supportResourcesId;
  if (!ref) return "";
  return typeof ref === "string" ? ref : ref._id;
}

/** The parent resource's title, when the API populated it. */
export function resourceRefTitle(item: ResourceLinked): string {
  const ref = item.supportResourcesId;
  return ref && typeof ref !== "string" ? ref.title : "";
}

/* ─── Chatbot priority ────────────────────────────────────────────────── */

// The API stores priority as free text; these are the values the panel
// writes. Anything else already stored is still shown as-is.
export const CHATBOT_PRIORITY_OPTIONS: SelectOption[] = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export const CHATBOT_PRIORITY_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Priority", value: "all" },
  ...CHATBOT_PRIORITY_OPTIONS,
];

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-primary/10 text-primary",
};

export function chatbotPriorityStyle(priority?: string): string {
  return (
    PRIORITY_STYLES[(priority ?? "").toLowerCase()] ??
    "bg-muted text-muted-foreground"
  );
}

/* ─── Learning video URLs ─────────────────────────────────────────────── */

export type VideoSource =
  | { kind: "youtube"; id: string; embedUrl: string }
  | { kind: "vimeo"; id: string; embedUrl: string }
  | { kind: "file"; url: string }
  | { kind: "link"; url: string };

const YOUTUBE_ID =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i;
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/i;
const VIDEO_FILE = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

/** Works out how a stored video URL can be played back in the panel. */
export function parseVideoUrl(url: string): VideoSource {
  const youtube = url.match(YOUTUBE_ID);
  if (youtube) {
    return {
      kind: "youtube",
      id: youtube[1],
      embedUrl: `https://www.youtube.com/embed/${youtube[1]}`,
    };
  }

  const vimeo = url.match(VIMEO_ID);
  if (vimeo) {
    return {
      kind: "vimeo",
      id: vimeo[1],
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
    };
  }

  return VIDEO_FILE.test(url) ? { kind: "file", url } : { kind: "link", url };
}

/** YouTube serves a still for every video — handy when no thumbnail is set. */
export function youtubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
