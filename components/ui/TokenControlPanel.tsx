"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                  CONFIG                                     */
/* -------------------------------------------------------------------------- */

const FONTS: Record<string, string> = {
  Geist: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  System:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  Mono: "var(--font-geist-mono), ui-monospace, monospace",
  Serif: 'ui-serif, Georgia, "Times New Roman", serif',
};

const BREAKPOINTS: [string, number][] = [
  ["xs", 384],
  ["sm", 640],
  ["md", 768],
  ["lg", 1024],
  ["xl", 1280],
  ["2xl", 1536],
  ["3xl", 1920],
];

type Controls = {
  spacing: number; // rem  (--spacing)
  radius: number; // rem   (--radius)
  shadow: number; // x     (--shadow-strength)
  fontScale: number; // %  (root font-size)
  fontFamily: keyof typeof FONTS;
  tracking: number; // em  (--tracking-base + --tracking-display)
  motion: number; // x     (--motion)
  zModal: number; // (--z-modal)
  zTooltip: number; // (--z-tooltip)
};

const DEFAULTS: Controls = {
  spacing: 0.25,
  radius: 0.625,
  shadow: 1,
  fontScale: 100,
  fontFamily: "Geist",
  tracking: 0,
  motion: 1,
  zModal: 1400,
  zTooltip: 1700,
};

const STORAGE_KEY = "token-controls";

/* -------------------------------------------------------------------------- */
/*                                  APPLY                                      */
/* -------------------------------------------------------------------------- */

function apply(c: Controls) {
  const r = document.documentElement;
  r.style.setProperty("--spacing", `${c.spacing}rem`);
  r.style.setProperty("--radius", `${c.radius}rem`);
  r.style.setProperty("--shadow-strength", String(c.shadow));
  r.style.fontSize = `${c.fontScale}%`;
  r.style.setProperty("--font-sans", FONTS[c.fontFamily]);
  r.style.setProperty("--tracking-base", `${c.tracking}em`);
  r.style.setProperty("--tracking-display", `${c.tracking - 0.02}em`);
  r.style.setProperty("--motion", String(c.motion));
  r.style.setProperty("--z-modal", String(c.zModal));
  r.style.setProperty("--z-tooltip", String(c.zTooltip));
}

function clearApplied() {
  const r = document.documentElement;
  [
    "--spacing",
    "--radius",
    "--shadow-strength",
    "--font-sans",
    "--tracking-base",
    "--tracking-display",
    "--motion",
    "--z-modal",
    "--z-tooltip",
  ].forEach((p) => r.style.removeProperty(p));
  r.style.removeProperty("font-size");
}

/* -------------------------------------------------------------------------- */
/*                                PRIMITIVES                                   */
/* -------------------------------------------------------------------------- */

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-border pb-4 last:border-0 last:pb-0">
      <p className="text-[11px] font-semibold tracking-display text-muted-foreground uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                    */
/* -------------------------------------------------------------------------- */

export function TokenControlPanel() {
  const [open, setOpen] = useState(false);
  const [c, setC] = useState<Controls>(DEFAULTS);
  const [width, setWidth] = useState(0);

  // Load persisted controls on mount. This has to happen in an effect rather
  // than a lazy initializer: localStorage doesn't exist during SSR, and seeding
  // state from it on the first client render would desync hydration.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as Controls;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
        setC(parsed);
        apply(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Live breakpoint monitor.
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const update = useCallback(
    <K extends keyof Controls>(key: K, value: Controls[K]) => {
      setC((prev) => {
        const next = { ...prev, [key]: value };
        apply(next);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setC(DEFAULTS);
    clearApplied();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const activeBp =
    [...BREAKPOINTS].reverse().find(([, px]) => width >= px)?.[0] ?? "base";

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle token controls"
        aria-expanded={open}
        className={cn(
          "fixed right-5 bottom-5 z-tooltip flex size-12 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "transition-transform duration-200 hover:scale-105 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={cn(
            "size-5 transition-transform duration-300",
            open && "rotate-90",
          )}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>
      </button>

      {/* Panel */}
      <aside
        className={cn(
          "fixed right-5 bottom-20 z-modal w-80 max-w-[calc(100vw-2.5rem)]",
          "max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl",
          "origin-bottom-right transition-all duration-300",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-card-foreground">
            Token Controls
          </h2>
          <button
            onClick={reset}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4">
          <Group title="Spacing">
            <Slider
              label="Base unit"
              value={c.spacing}
              min={0.15}
              max={0.4}
              step={0.01}
              unit="rem"
              onChange={(v) => update("spacing", v)}
            />
          </Group>

          <Group title="Radius">
            <Slider
              label="Corner radius"
              value={c.radius}
              min={0}
              max={2}
              step={0.025}
              unit="rem"
              onChange={(v) => update("radius", v)}
            />
          </Group>

          <Group title="Shadow">
            <Slider
              label="Elevation strength"
              value={c.shadow}
              min={0}
              max={3}
              step={0.1}
              unit="×"
              onChange={(v) => update("shadow", v)}
            />
          </Group>

          <Group title="Typography">
            <Slider
              label="Base size"
              value={c.fontScale}
              min={85}
              max={125}
              step={1}
              unit="%"
              onChange={(v) => update("fontScale", v)}
            />
            <Slider
              label="Letter spacing"
              value={c.tracking}
              min={-0.05}
              max={0.1}
              step={0.005}
              unit="em"
              onChange={(v) => update("tracking", v)}
            />
            <label className="block">
              <span className="mb-1.5 block text-xs text-foreground">
                Font family
              </span>
              <select
                value={c.fontFamily}
                onChange={(e) =>
                  update("fontFamily", e.target.value as keyof typeof FONTS)
                }
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Object.keys(FONTS).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </Group>

          <Group title="Animation">
            <Slider
              label="Motion speed"
              value={c.motion}
              min={0}
              max={2}
              step={0.05}
              unit="×"
              onChange={(v) => update("motion", v)}
            />
            <p className="text-[11px] text-muted-foreground">
              0 = instant · 1 = default · 2 = slow. Affects{" "}
              <code className="font-mono">animate-*</code> presets.
            </p>
          </Group>

          <Group title="Z-index">
            <Slider
              label="Modal layer"
              value={c.zModal}
              min={1000}
              max={2000}
              step={50}
              onChange={(v) => update("zModal", v)}
            />
            <Slider
              label="Tooltip layer"
              value={c.zTooltip}
              min={1000}
              max={2000}
              step={50}
              onChange={(v) => update("zTooltip", v)}
            />
          </Group>

          <Group title="Breakpoint (live monitor)">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Viewport</span>
              <span className="font-mono text-foreground">{width}px</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[["base", 0] as [string, number], ...BREAKPOINTS].map(
                ([name]) => (
                  <span
                    key={name}
                    className={cn(
                      "rounded-md px-2 py-1 font-mono text-[11px] transition-colors",
                      activeBp === name
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {name}
                  </span>
                ),
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Breakpoints are compiled into media queries, so they can&apos;t
              change at runtime — edit{" "}
              <code className="font-mono">--breakpoint-*</code> in globals.css.
            </p>
          </Group>
        </div>
      </aside>
    </>
  );
}
