"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal/Modal";
import { cn } from "@/lib/utils";
import {
  Search,
  Command,
  FileText,
  Settings,
  User,
  ShoppingCart,
  Users,
  CornerDownLeft,
} from "lucide-react";
import Link from "next/link";

// Accent per shortcut. Alpha backgrounds sit on whatever surface is behind
// them, so one class works in both themes.
const SHORTCUTS = [
  {
    href: "/",
    icon: FileText,
    title: "Manage Products",
    desc: "View and edit your store inventory",
    accent: "text-indigo-500",
    accentHover: "group-hover:text-indigo-500",
    accentBg: "bg-indigo-500/10 ring-indigo-500/20",
  },
  {
    href: "/settings",
    icon: Settings,
    title: "Dashboard Settings",
    desc: "System configurations and preferences",
    accent: "text-sky-500",
    accentHover: "group-hover:text-sky-500",
    accentBg: "bg-sky-500/10 ring-sky-500/20",
  },
  {
    href: "/orders",
    icon: ShoppingCart,
    title: "Manage Orders",
    desc: "View and track recent purchases",
    accent: "text-amber-500",
    accentHover: "group-hover:text-amber-500",
    accentBg: "bg-amber-500/10 ring-amber-500/20",
  },
  {
    href: "/customers",
    icon: Users,
    title: "Customer Directory",
    desc: "Manage users and customer profiles",
    accent: "text-cyan-500",
    accentHover: "group-hover:text-cyan-500",
    accentBg: "bg-cyan-500/10 ring-cyan-500/20",
  },
];

export function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      const timer = setTimeout(() => setQuery(""), 200); // clear after fade-out
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Header Widget */}
      <div className="flex items-center gap-2 sm:max-w-xs sm:w-full">
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            // Base / Mobile styles (matches other header icons)
            "relative size-9 rounded-[11px] flex items-center justify-center cursor-pointer transition-all duration-200 outline-none",
            "bg-muted hover:bg-accent border border-border hover:border-primary/50",
            "text-muted-foreground",
            // Desktop styles (sm and up)
            "sm:w-full sm:justify-between sm:pl-10 sm:pr-3 sm:py-2.5 sm:rounded-full sm:h-auto sm:leading-5",
            "group",
          )}
        >
          {/* Mobile Icon */}
          <Search className="size-4 sm:hidden group-hover:text-primary transition-colors" />

          {/* Desktop Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 hidden sm:flex items-center pointer-events-none">
            <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
          </div>

          <span className="text-sm hidden sm:inline">Search anything...</span>

          <div className="hidden sm:flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-card px-1 font-sans text-[14px] font-medium text-muted-foreground">
              ⌘
            </kbd>
            <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-card px-1 font-sans text-[10px] font-medium text-muted-foreground">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Modal Portal */}
      <Modal
        open={isOpen}
        onClose={handleClose}
        size="xlarge"
        showCloseButton={false}
        className="p-0 overflow-hidden [&>div.p-3]:p-0! border-0 rounded-xl"
        overlayClassName="bg-black/50 backdrop-blur-sm"
      >
        <div className="flex flex-col w-full bg-popover text-popover-foreground rounded-lg">
          {/* Main Input */}
          <div className="flex items-center px-4 py-3 border-b border-border relative bg-muted/50">
            <Search className="h-5 w-5 text-muted-foreground absolute left-5" />
            <input
              ref={inputRef}
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
            />
            <kbd
              className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md border border-border bg-card font-sans text-xs font-medium text-muted-foreground cursor-pointer hover:bg-accent transition"
              onClick={handleClose}
            >
              ESC
            </kbd>
          </div>

          {/* Dynamic Search Results */}
          <div className="p-3 custom-scroll">
            {query.length > 0 ? (
              <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  No exact results found for &quot;
                  <span className="text-foreground font-semibold">{query}</span>
                  &quot;
                </div>
              </div>
            ) : (
              <>
                <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  Quick Shortcuts
                </div>
                <div className="space-y-1 mb-4 mt-2">
                  {SHORTCUTS.map((shortcut) => {
                    const Icon = shortcut.icon;
                    return (
                      <Link
                        key={shortcut.title}
                        href={shortcut.href}
                        onClick={handleClose}
                        className="group flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "size-9 center rounded-lg ring-1 transition-transform group-hover:scale-105",
                              shortcut.accentBg,
                              shortcut.accent,
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "text-sm font-semibold text-foreground transition-colors",
                                shortcut.accentHover,
                              )}
                            >
                              {shortcut.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {shortcut.desc}
                            </span>
                          </div>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-2 pr-2">
                          <span className="text-xs text-muted-foreground">
                            Jump to
                          </span>
                          <ChevronRight
                            className={cn("h-4 w-4", shortcut.accent)}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase pt-4 tracking-widest border-t border-border">
                  Actions
                </div>
                <div className="space-y-1 mt-2">
                  <button
                    onClick={handleClose}
                    className="w-full text-left group flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-9 center rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20 transition-transform group-hover:scale-105">
                        <User className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                          Create New User
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Add a new admin to your workspace
                        </span>
                      </div>
                    </div>
                    <div className="hidden group-hover:flex items-center pr-2">
                      <Command className="h-4 w-4 text-emerald-500" />
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hidden sm:flex items-center gap-1.5">
                <kbd className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-card border border-border font-sans font-medium text-[12px] text-muted-foreground">
                  ↑↓
                </kbd>
                to navigate
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <kbd className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-card border border-border font-sans font-bold text-[12px] text-muted-foreground">
                  <CornerDownLeft className="size-3" />
                </kbd>
                to select
              </span>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              Search by{" "}
              <span className="font-semibold text-foreground">Retwho</span>
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
