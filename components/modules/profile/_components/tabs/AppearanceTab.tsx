"use client";

import { Sun, Moon, Monitor, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "../shared/Section";
import { ToggleRow } from "../shared/ToggleRow";
import { SaveButton } from "../shared/SaveButton";
import { AppearancePrefs } from "../../_types/profile.types";
import { Button } from "@/components/ui/button/Button";

interface AppearanceTabProps {
  prefs: AppearancePrefs;
  onChange: (prefs: AppearancePrefs) => void;
  saveStatus: "idle" | "saving" | "saved";
  onSave: () => void;
}

export default function AppearanceTab({
  prefs,
  onChange,
  saveStatus,
  onSave,
}: AppearanceTabProps) {
  const set = (key: keyof AppearancePrefs) => (v: string | boolean) =>
    onChange({ ...prefs, [key]: v });

  return (
    <div className="space-y-8">
      <Section title="Theme" desc="Choose your preferred color scheme.">
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => set("theme")(t.id)}
              className={cn(
                "p-4 rounded-lg border text-center transition-all cursor-pointer",
                prefs.theme === t.id
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-border/40 dark:border-darkBorder/40 hover:border-primary/30 hover:bg-gray-light dark:hover:bg-darkPrimary",
              )}
            >
              <t.icon
                className={cn(
                  "w-6 h-6 mx-auto mb-1.5",
                  prefs.theme === t.id ? "text-primary" : "text-text5",
                )}
              />
              <p
                className={cn(
                  "text-xs font-medium",
                  prefs.theme === t.id
                    ? "text-primary"
                    : "text-text6 dark:text-text4",
                )}
              >
                {t.label}
              </p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Density" desc="Adjust the spacing and density of the UI.">
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "compact", label: "Compact", desc: "More content per view" },
            {
              id: "comfortable",
              label: "Comfortable",
              desc: "Balanced spacing",
            },
            { id: "spacious", label: "Spacious", desc: "Relaxed & airy feel" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => set("density")(d.id)}
              className={cn(
                "p-4 rounded-lg border text-left transition-all cursor-pointer",
                prefs.density === d.id
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-border/40 dark:border-darkBorder/40 hover:border-primary/30 hover:bg-gray-light dark:hover:bg-darkPrimary",
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold mb-1",
                  prefs.density === d.id
                    ? "text-primary"
                    : "text-text6 dark:text-text4",
                )}
              >
                {d.label}
              </p>
              <p className="text-[10px] text-text5">{d.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Display Preferences"
        desc="Customize how the interface behaves."
      >
        <div className="divide-y divide-border/30 dark:divide-darkBorder/30">
          <ToggleRow
            label="Animations & Transitions"
            desc="Enable smooth UI animations"
            enabled={prefs.animations}
            onChange={(v) => set("animations")(v)}
          />
          <ToggleRow
            label="Collapse Sidebar by Default"
            desc="Start with the sidebar minimized"
            enabled={prefs.sidebarCollapsed}
            onChange={(v) => set("sidebarCollapsed")(v)}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4" />
          Update Password
        </Button>
      </div>
    </div>
  );
}
