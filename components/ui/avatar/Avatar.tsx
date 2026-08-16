"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useState,
  type HTMLAttributes,
  type ReactElement,
} from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarRounded = "md" | "lg" | "xl" | "full";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  /** Required when `src` is set — also used to derive fallback initials. */
  alt?: string;
  /** Explicit fallback content; defaults to initials derived from `alt`. */
  fallback?: string;
  size?: AvatarSize;
  rounded?: AvatarRounded;
  status?: AvatarStatus;
  /** Ring around the avatar (used automatically inside AvatarGroup). */
  ring?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                               DESIGN TOKENS                                */
/* -------------------------------------------------------------------------- */

const SIZE: Record<AvatarSize, string> = {
  xs: "size-6 text-2xs",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
};

const ROUNDED: Record<AvatarRounded, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const STATUS: Record<AvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-muted-foreground/60",
  busy: "bg-destructive",
  away: "bg-warning",
};

const STATUS_LABEL: Record<AvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  away: "Away",
};

const STATUS_SIZE: Record<AvatarSize, string> = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-3.5",
};

function initialsOf(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

/* -------------------------------------------------------------------------- */
/*                                  AVATAR                                    */
/* -------------------------------------------------------------------------- */

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      fallback,
      size = "md",
      rounded = "full",
      status,
      ring = false,
      ...props
    },
    ref,
  ) => {
    const [failed, setFailed] = useState(false);
    const showImage = src && !failed;

    return (
      <span
        ref={ref}
        className={cn("relative inline-flex shrink-0", SIZE[size], className)}
        {...props}
      >
        <span
          className={cn(
            "flex size-full items-center justify-center overflow-hidden select-none",
            "bg-muted font-medium text-muted-foreground",
            ROUNDED[rounded],
            ring && "ring-2 ring-background",
          )}
        >
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatars come from arbitrary hosts; next/image needs domain config
            <img
              src={src}
              alt={alt ?? ""}
              className="size-full object-cover"
              loading="lazy"
              onError={() => setFailed(true)}
            />
          ) : (
            <span
              aria-hidden={alt ? undefined : true}
              role={alt ? "img" : undefined}
              aria-label={alt}
            >
              {fallback ?? initialsOf(alt)}
            </span>
          )}
        </span>

        {status && (
          <span
            role="status"
            aria-label={STATUS_LABEL[status]}
            className={cn(
              "absolute right-0 bottom-0 rounded-full ring-2 ring-background",
              STATUS[status],
              STATUS_SIZE[size],
              rounded !== "full" && "translate-x-1/4 translate-y-1/4",
            )}
          />
        )}
      </span>
    );
  },
);

Avatar.displayName = "Avatar";

/* -------------------------------------------------------------------------- */
/*                                AVATAR GROUP                                */
/* -------------------------------------------------------------------------- */

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars shown before collapsing into a “+N” counter. */
  max?: number;
  size?: AvatarSize;
  rounded?: AvatarRounded;
}

function AvatarGroup({
  className,
  children,
  max = 4,
  size = "md",
  rounded = "full",
  ...props
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <div
      className={cn("flex items-center -space-x-2", className)}
      role="group"
      {...props}
    >
      {visible.map((child) =>
        cloneElement(child as ReactElement<AvatarProps>, {
          size,
          rounded,
          ring: true,
        }),
      )}

      {overflow > 0 && (
        <span
          className={cn(
            "flex items-center justify-center select-none",
            "bg-secondary font-medium text-secondary-foreground ring-2 ring-background",
            SIZE[size],
            ROUNDED[rounded],
          )}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
