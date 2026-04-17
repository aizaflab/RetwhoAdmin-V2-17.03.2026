import { Toggle } from "./Toggle";

export function ToggleRow({
  label,
  desc,
  enabled,
  onChange,
  badge,
}: {
  label: string;
  desc: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text6 dark:text-text4">
            {label}
          </p>
          {badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-text5 mt-0.5">{desc}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}
