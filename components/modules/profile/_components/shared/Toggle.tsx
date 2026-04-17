import { cn } from "@/lib/utils";

export function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0",
        enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300",
          enabled ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
