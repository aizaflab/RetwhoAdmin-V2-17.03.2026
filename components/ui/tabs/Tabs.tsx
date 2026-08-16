"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { mergeRefs } from "@/lib/merge-refs";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

/** underline = ruled bar · pill = floating card · segmented = inset track · capsule = rounded track · accent = inset track, accent fill */
export type TabsVariant =
  | "underline"
  | "pill"
  | "segmented"
  | "capsule"
  | "accent";
export type TabsSize = "sm" | "md";
export type TabsOrientation = "horizontal" | "vertical";
/**
 * How the active panel animates in:
 * - `slide` (default): along the tab axis, direction-aware (left/right or up/down)
 * - `slide-up`: always rises from the bottom
 * - `slide-down`: always drops from the top
 * - `fade`: opacity only, no travel
 */
export type TabsPanelMotion = "slide" | "slide-up" | "slide-down" | "fade";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
  panelMotion: TabsPanelMotion;
  fullWidth: boolean;
  indicatorClassName?: string;
  /** -1 back, 1 forward, 0 unknown. Panels slide the way the indicator moved. */
  direction: number;
  /** Triggers announce themselves on mount, in DOM order, to seed `direction`. */
  registerTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`);
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*                                    TABS                                    */
/* -------------------------------------------------------------------------- */

interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
  /** How the active panel animates in. Defaults to `slide` (tab-axis, direction-aware). */
  panelMotion?: TabsPanelMotion;
  /** Stretch the list to fill its container and share the width evenly. */
  fullWidth?: boolean;
  /** Restyle the fill that slides behind the selected tab. */
  indicatorClassName?: string;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      variant = "underline",
      size = "md",
      orientation = "horizontal",
      panelMotion = "slide",
      fullWidth = false,
      indicatorClassName,
      ...props
    },
    ref,
  ) => {
    const baseId = useId();
    const [current, setValue] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    });

    // Tab order can't be read from `children` — triggers may be nested or mapped.
    // They register on mount instead, which lands them in DOM order.
    const order = useRef<string[]>([]);
    const [direction, setDirection] = useState(0);

    const registerTab = useCallback((tab: string) => {
      if (!order.current.includes(tab)) order.current.push(tab);
    }, []);

    const select = useCallback(
      (next: string) => {
        const from = order.current.indexOf(current);
        const to = order.current.indexOf(next);
        // An unregistered tab gives no axis to travel along, so cross-fade flat.
        setDirection(from < 0 || to < 0 ? 0 : Math.sign(to - from));
        setValue(next);
      },
      [current, setValue],
    );

    return (
      <TabsContext.Provider
        value={{
          value: current,
          setValue: select,
          baseId,
          variant,
          size,
          orientation,
          panelMotion,
          fullWidth,
          indicatorClassName,
          direction,
          registerTab,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "flex w-full",
            orientation === "vertical"
              ? "flex-row items-start gap-3"
              : "flex-col gap-3",
            className,
          )}
          {...props}
        />
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

/* -------------------------------------------------------------------------- */
/*                                  TABS LIST                                 */
/* -------------------------------------------------------------------------- */

const LIST: Record<TabsVariant, Record<TabsOrientation, string>> = {
  underline: {
    horizontal: "gap-1 border-b border-border",
    vertical: "flex-col gap-1 border-l border-border",
  },
  pill: { horizontal: "gap-1", vertical: "flex-col gap-1 items-stretch" },
  segmented: {
    horizontal: "gap-1 rounded-md border border-border bg-muted p-0.5",
    vertical:
      "flex-col gap-1 rounded-md border border-border bg-muted p-0.5 items-stretch",
  },
  capsule: {
    horizontal: "gap-1 rounded-full border border-border bg-muted p-0.5",
    vertical:
      "flex-col gap-1 rounded-full border border-border bg-muted p-0.5 items-stretch",
  },
  accent: {
    horizontal: "gap-1 rounded-md border border-border bg-muted p-0.5",
    vertical:
      "flex-col gap-1 rounded-md border border-border bg-muted p-0.5 items-stretch",
  },
};

/** `useLayoutEffect` warns during SSR; the measure only ever runs in the browser. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Critically damped: at stiffness 500 / mass 1, overshoot starts below
 * `damping = 2 * sqrt(500) ~= 44.7`. An overshooting indicator paints past the
 * last tab, and that overhang lands in the list's scrollable area — a scrollbar
 * that flashes for as long as the spring takes to settle.
 */
const INDICATOR_TRANSITION = {
  type: "spring",
  stiffness: 500,
  damping: 45,
  mass: 1,
} as const;

/** Box of the selected tab, relative to the list, in px. */
interface IndicatorRect {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Far edge of the last tab — how wide the svg has to be to cover them all. */
  extent: number;
}

const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, onKeyDown, children, ...props }, ref) => {
    const { value, variant, orientation, fullWidth, indicatorClassName } =
      useTabs("TabsList");
    const listRef = useRef<HTMLDivElement | null>(null);
    const [rect, setRect] = useState<IndicatorRect | null>(null);

    const isUnderline = variant === "underline";
    const isVertical = orientation === "vertical";

    // Every variant animates a measured box, never framer's `layoutId`. A shared
    // `layoutId` moves via a `scaleX` transform between tabs of different widths,
    // and framer rounds that projection to the pixel grid on the final frame —
    // the fill lands ~1px narrow, worst on the left-pinned first tab. Measuring
    // the selected tab and animating real `x/width` sidesteps the transform, so
    // the box settles exactly on the tab.
    useIsomorphicLayoutEffect(() => {
      const list = listRef.current;
      if (!list) return;

      const measure = () => {
        const tabs = Array.from(
          list.querySelectorAll<HTMLElement>('[role="tab"]'),
        );
        const tab = tabs.find((t) => t.ariaSelected === "true");
        if (!tab) return setRect(null);

        // Derive the extent from the tabs themselves, never from `scrollWidth`:
        // the svg is a child, so sizing it off scrollWidth would feed back into it.
        const far = (t: HTMLElement) =>
          isVertical
            ? t.offsetTop + t.offsetHeight
            : t.offsetLeft + t.offsetWidth;

        // `list` is `position: relative`, so offsetLeft/Top are relative to it.
        setRect({
          x: tab.offsetLeft,
          y: tab.offsetTop,
          width: tab.offsetWidth,
          height: tab.offsetHeight,
          extent: Math.max(...tabs.map(far)),
        });
      };

      measure();
      // Fonts loading or the container resizing both move the tabs.
      const ro = new ResizeObserver(measure);
      ro.observe(list);
      for (const child of Array.from(list.children)) ro.observe(child);
      return () => ro.disconnect();
    }, [isVertical, value]);

    // Roving focus: the axis keys, Home and End move and activate tabs.
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      const tabs = Array.from(
        listRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="tab"]:not(:disabled)',
        ) ?? [],
      );
      if (!tabs.length) return;
      const [prevKey, nextKey] =
        orientation === "vertical"
          ? ["ArrowUp", "ArrowDown"]
          : ["ArrowLeft", "ArrowRight"];
      const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
      let next = -1;
      if (e.key === nextKey) next = (i + 1) % tabs.length;
      else if (e.key === prevKey) next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next >= 0) {
        e.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      }
    };

    return (
      <div
        ref={mergeRefs(ref, listRef)}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex max-w-full items-center",
          orientation === "horizontal" && "scrollbar-none overflow-x-auto",
          fullWidth ? "w-full" : "w-fit",
          LIST[variant][orientation],
          className,
        )}
        {...props}
      >
        {/* The fill sits behind the tabs (rendered first, and every label is
            `z-10`), so transparent triggers let it show through with their text
            on top. */}
        {!isUnderline && rect && (
          <motion.div
            aria-hidden="true"
            data-slot="tabs-indicator"
            initial={false}
            animate={{
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            }}
            transition={INDICATOR_TRANSITION}
            className={cn(
              "pointer-events-none absolute top-0 left-0",
              INDICATOR[variant as Exclude<TabsVariant, "underline">][
                orientation
              ],
              indicatorClassName,
            )}
          />
        )}

        {children}

        {isUnderline && rect && (
          <svg
            aria-hidden="true"
            // The list is a scroll container (overflow-x-auto forces overflow-y
            // to auto), and an absolute child's overflow still feeds its scrollable
            // area. So: sized to the tabs, clipped, and flush to the edge — the
            // spring overshoots `width`, which would otherwise raise a scrollbar.
            style={
              isVertical ? { height: rect.extent } : { width: rect.extent }
            }
            // No viewBox: one SVG user unit stays one CSS px, so the measured
            // offsets can be fed straight to the rect.
            className={cn(
              "pointer-events-none absolute overflow-hidden",
              isVertical ? "top-0 left-0 w-0.5" : "bottom-0 left-0 h-0.5",
            )}
          >
            <motion.rect
              rx={1}
              data-slot="tabs-indicator"
              initial={false}
              animate={
                isVertical
                  ? { x: 0, width: 2, y: rect.y, height: rect.height }
                  : { y: 0, height: 2, x: rect.x, width: rect.width }
              }
              transition={INDICATOR_TRANSITION}
              className={cn(UNDERLINE_FILL, indicatorClassName)}
            />
          </svg>
        )}
      </div>
    );
  },
);
TabsList.displayName = "TabsList";

/* -------------------------------------------------------------------------- */
/*                                 TABS TRIGGER                               */
/* -------------------------------------------------------------------------- */

const TRIGGER_SIZE: Record<TabsSize, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-9 px-3 text-sm",
};

/** Space between icon, label and badge inside a trigger. */
const TRIGGER_GAP: Record<TabsSize, string> = {
  sm: "gap-1.5",
  md: "gap-2",
};

/** Icon-only triggers are square, so the height doubles as the width. */
const TRIGGER_SQUARE: Record<TabsSize, string> = {
  sm: "h-7 w-7 px-0",
  md: "h-9 w-9 px-0",
};

const ICON_SIZE: Record<TabsSize, string> = {
  sm: "[&_svg]:size-3.5",
  md: "[&_svg]:size-4",
};

/** Kept in step with the indicator radius so the focus ring traces the fill. */
const TRIGGER_RADIUS: Record<TabsVariant, string> = {
  underline: "",
  pill: "rounded-lg",
  segmented: "rounded-md",
  capsule: "rounded-full",
  accent: "rounded-sm",
};

/** Selected label color. Every variant but `accent` sits on a neutral fill. */
const SELECTED_TEXT: Record<TabsVariant, string> = {
  underline: "text-foreground",
  pill: "text-foreground",
  segmented: "text-foreground",
  capsule: "text-foreground",
  accent: "text-accent-foreground",
};

/** Paints the `<rect>` the underline variant draws inside `TabsList`. */
const UNDERLINE_FILL = "fill-foreground";

/**
 * The moving fill behind the selected trigger. `TabsList` measures the tab and
 * animates this box to its position/size, so these classes carry only the paint
 * — positioning comes from the measured rect. `underline` is absent: it renders
 * an animated `<svg>` in `TabsList` instead.
 */
const INDICATOR: Record<
  Exclude<TabsVariant, "underline">,
  Record<TabsOrientation, string>
> = {
  pill: {
    horizontal: "rounded-lg border border-border bg-card shadow-sm",
    vertical: "rounded-md border border-border bg-card shadow-sm",
  },
  segmented: {
    horizontal: "rounded-sm border border-border bg-background shadow-sm",
    vertical: "rounded-md border border-border bg-background shadow-sm",
  },
  capsule: {
    horizontal: "rounded-full border border-white/12 bg-white/5 shadow-sm",
    vertical: "rounded-full border border-border bg-secondary shadow-sm",
  },
  accent: {
    horizontal: "rounded-sm bg-accent shadow-sm",
    vertical: "rounded-sm bg-accent shadow-sm",
  },
};

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  /** Leading icon. Omit `children` for an icon-only (square) trigger. */
  icon?: ReactNode;
  /** Count or label chip. Floats over the corner on icon-only triggers. */
  badge?: ReactNode;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, icon, badge, onClick, children, ...props }, ref) => {
    const ctx = useTabs("TabsTrigger");
    const selected = ctx.value === value;
    const iconOnly = icon != null && children == null;

    const { registerTab } = ctx;
    useEffect(() => {
      registerTab(value);
    }, [registerTab, value]);

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${ctx.baseId}-tab-${value}`}
        aria-selected={selected}
        aria-controls={`${ctx.baseId}-panel-${value}`}
        tabIndex={selected ? 0 : -1}
        onClick={(e) => {
          ctx.setValue(value);
          onClick?.(e);
        }}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center justify-center select-none",
          "font-medium whitespace-nowrap transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          TRIGGER_SIZE[ctx.size],
          iconOnly && TRIGGER_SQUARE[ctx.size],
          ICON_SIZE[ctx.size],
          TRIGGER_RADIUS[ctx.variant],
          ctx.fullWidth && "flex-1",
          selected
            ? SELECTED_TEXT[ctx.variant]
            : "text-muted-foreground hover:text-foreground",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "relative z-10 inline-flex items-center",
            TRIGGER_GAP[ctx.size],
          )}
        >
          {icon}
          {children}
          {badge != null && !iconOnly && (
            <span
              className={cn(
                "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-2xs font-medium",
                selected
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {badge}
            </span>
          )}
        </span>

        {badge != null && iconOnly && (
          <span
            className={cn(
              "absolute -top-1 -right-1 z-10 inline-flex h-4 min-w-4 items-center justify-center",
              "rounded-full bg-foreground px-1 text-2xs font-medium text-background",
            )}
          >
            {badge}
          </span>
        )}
      </button>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

/* -------------------------------------------------------------------------- */
/*                                 TABS CONTENT                               */
/* -------------------------------------------------------------------------- */

/** Travel distance of a panel as it enters or leaves, in px. */
const PANEL_SHIFT = 16;

/**
 * The outgoing panel clears out faster than the incoming one arrives, and the
 * incoming one is held back by `delay` until most of that has happened. Fading
 * both across the same window would leave a beat where each is half-transparent
 * and the text of the two panels reads through one another.
 */
const PANEL_ENTER = {
  duration: 0.26,
  delay: 0.09,
  // Decelerate hard: the panel arrives quickly, then settles.
  ease: [0.16, 1, 0.3, 1],
} as const;

const PANEL_EXIT = {
  duration: 0.14,
  ease: [0.4, 0, 1, 1],
} as const;

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = useTabs("TabsContent");
    const selected = ctx.value === value;
    const reduceMotion = useReducedMotion();

    // How the panel travels as it enters/leaves. `slide` follows the indicator
    // along the tab axis (direction-aware); `slide-up`/`slide-down` always move
    // vertically the same way; `fade` (and reduced motion) is opacity only.
    let enter: Record<string, number> = {};
    let leave: Record<string, number> = {};
    if (!reduceMotion) {
      if (ctx.panelMotion === "slide-up") {
        enter = { y: PANEL_SHIFT };
        leave = { y: -PANEL_SHIFT };
      } else if (ctx.panelMotion === "slide-down") {
        enter = { y: -PANEL_SHIFT };
        leave = { y: PANEL_SHIFT };
      } else if (ctx.panelMotion === "slide") {
        // Enter from the side the panel came from; leave toward the side it went.
        // Direction 0 (first paint, or an unregistered tab) is a straight fade.
        const shift = ctx.orientation === "vertical" ? "y" : "x";
        const travel = ctx.direction * PANEL_SHIFT;
        enter = { [shift]: travel };
        leave = { [shift]: -travel };
      }
    }

    return (
      // Each panel owns its own presence, so `mode="wait"` could never sequence
      // them — it only orders siblings within one AnimatePresence. `popLayout`
      // lifts the outgoing panel out of flow instead, so the two never stack.
      <AnimatePresence mode="popLayout" initial={false}>
        {selected && (
          <motion.div
            key={value}
            initial={{ opacity: 0, ...enter }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            // The leaving panel carries its own timing: a target's `transition`
            // overrides the base one, which is the only way to time exit apart
            // from enter on a single element.
            exit={{ opacity: 0, ...leave, transition: PANEL_EXIT }}
            transition={PANEL_ENTER}
            // Framer animates transform via `translate`, which resamples text on
            // every frame. Promoting the panel keeps the type from shimmering.
            style={{ willChange: "transform, opacity" }}
            className="min-w-0 flex-1"
          >
            <div
              ref={ref}
              role="tabpanel"
              id={`${ctx.baseId}-panel-${value}`}
              aria-labelledby={`${ctx.baseId}-tab-${value}`}
              tabIndex={0}
              className={cn(
                "rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                className,
              )}
              {...props}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
