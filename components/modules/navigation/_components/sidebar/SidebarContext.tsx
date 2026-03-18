"use client";
import { createContext } from "react";
import { AdminMenuItem } from "@/components/modules/access-control";

export type HoverState = {
  item: AdminMenuItem | null;
  rect: DOMRect | null;
  isHovered: boolean;
};

export const HoverContext = createContext<{
  setHover: (e: React.MouseEvent, item: AdminMenuItem) => void;
  clearHover: () => void;
} | null>(null);

export function isPathActive(pathname: string, itemPath?: string) {
  if (!itemPath) return false;
  if (pathname === itemPath) return true;
  return pathname.startsWith(`${itemPath}/`);
}

export function hasActiveChild(pathname: string, children?: AdminMenuItem[]) {
  if (!children?.length) return false;
  return children.some((child) => isPathActive(pathname, child.path));
}
