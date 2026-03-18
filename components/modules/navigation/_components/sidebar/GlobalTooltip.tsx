"use client";
import { createPortal } from "react-dom";
import { SidebarItem } from "./SidebarItem";
import { HoverState } from "./SidebarContext";
import { AdminMenuItem } from "@/components/modules/access-control";

interface GlobalTooltipProps {
  hoverState: HoverState;
  pathname: string;
  keepHover: () => void;
  clearHover: () => void;
}

export function GlobalTooltip({
  hoverState,
  pathname,
  keepHover,
  clearHover,
}: GlobalTooltipProps) {
  if (!hoverState.rect || !hoverState.item || typeof window === "undefined")
    return null;

  const { item, rect, isHovered } = hoverState;
  const isGroup = item.type === "group" && !!item.children?.length;
  const isBottomClipped = isGroup && rect.top + 300 > window.innerHeight;

  return createPortal(
    <div
      className="fixed z-100 drop-shadow-lg transition-all duration-200 ease-in-out pointer-events-auto"
      style={{
        left: rect.right + 18,
        top: isGroup
          ? isBottomClipped
            ? "auto"
            : Math.max(16, rect.top - 10)
          : rect.top + rect.height / 2,
        bottom: isGroup && isBottomClipped ? 16 : "auto",
        transform: isGroup ? "translateY(0)" : "translateY(-50%)",
        opacity: isHovered ? 1 : 0,
        visibility: isHovered ? "visible" : "hidden",
        pointerEvents: isHovered ? "auto" : "none",
      }}
      onMouseEnter={keepHover}
      onMouseLeave={clearHover}
    >
      {isGroup ? (
        <div className="min-w-[200px] bg-white border border-slate-200 rounded-md p-2 dark:bg-slate-900 dark:border-slate-700 h-full flex flex-col transition-all duration-300">
          <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-2 truncate">
            {item.title}
          </div>
          <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scroll">
            {item.children?.map((child: AdminMenuItem) => (
              <SidebarItem
                key={child.id}
                item={child}
                pathname={pathname}
                collapsed={false}
                isSubmenu
                hideDot
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-slate-900 rotate-45 -mr-2 z-[-1] absolute" />
          <div className="bg-slate-900 border border-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-xl whitespace-nowrap z-10 transition-all">
            {item.title}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
