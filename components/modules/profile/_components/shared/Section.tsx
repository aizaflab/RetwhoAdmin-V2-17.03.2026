import React from "react";

export function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-black dark:text-white">
          {title}
        </h3>
        {desc && <p className="text-xs text-text5 mt-0.5">{desc}</p>}
      </div>
      <div className="h-px bg-border/50 dark:bg-darkBorder/50" />
      {children}
    </div>
  );
}
