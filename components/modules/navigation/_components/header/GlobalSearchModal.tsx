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
            "relative size-8 rounded-[11px] flex items-center justify-center cursor-pointer transition-all duration-200 outline-none",
            "bg-gray-light dark:bg-darkPrimary hover:bg-gray-medium/20 dark:hover:bg-primary/20",
            "border border-border dark:border-darkBorder hover:border-border/70 dark:hover:border-darkBorder",

            "text-text6 dark:text-text5",
            // Desktop styles (sm and up)
            "sm:w-full sm:justify-between sm:pl-10 sm:pr-3 sm:py-2.5 sm:rounded-full sm:h-auto sm:leading-5",
            "dark:bg-darkBorder/30 hover:bg-gray-mid dark:hover:bg-darkBorder/40 border-slate-200 dark:border-darkBorder",
            "group",
          )}
        >
          {/* Mobile Icon */}
          <Search className="size-[18px] sm:hidden group-hover:text-primary transition-colors" />

          {/* Desktop Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 hidden sm:flex items-center pointer-events-none">
            <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
          </div>

          <span className="text-sm hidden sm:inline">Search anything...</span>

          <div className="hidden sm:flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border dark:border-primary/30 bg-white dark:bg-darkPrimary px-1 font-sans text-[14px] font-medium text-text5 dark:text-text4">
              ⌘
            </kbd>
            <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border dark:border-darkBorder bg-white dark:bg-darkPrimary px-1 font-sans text-[10px] font-medium text-text5 dark:text-text4">
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
        overlayClassName="bg-darkBg/40 backdrop-blur-sm dark:bg-black/60"
      >
        <div className="flex flex-col w-full bg-white dark:bg-darkPrimary rounded-lg">
          {/* Main Input */}
          <div className="flex items-center px-4 py-3 border-b border-border dark:border-darkBorder relative bg-gray-light/50 dark:bg-darkPrimary/20">
            <Search className="h-5 w-5 text-text4 absolute left-5" />
            <input
              ref={inputRef}
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent pl-10 pr-4 py-2 text-black dark:text-white placeholder-text4 focus:outline-none text-sm"
            />
            <kbd
              className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md border border-border dark:border-darkBorder bg-white dark:bg-darkBorder font-sans text-xs font-medium text-text5 dark:text-text4 cursor-pointer hover:bg-gray-light dark:hover:bg-darkBorder/80 transition"
              onClick={handleClose}
            >
              ESC
            </kbd>
          </div>

          {/* Dynamic Search Results */}
          <div className="p-3 custom-scroll">
            {query.length > 0 ? (
              <div className="py-20 text-center text-sm text-text5 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-border dark:bg-darkBorder flex items-center justify-center">
                  <Search className="h-8 w-8 text-text4 dark:text-text5" />
                </div>
                <div>
                  No exact results found for &quot;
                  <span className="text-black dark:text-border font-semibold">
                    {query}
                  </span>
                  &quot;
                </div>
              </div>
            ) : (
              <>
                <div className="px-2 py-1 text-[10px] font-medium text-text4 dark:text-text5 uppercase tracking-widest">
                  Quick Shortcuts
                </div>
                <div className="space-y-1 mb-4 mt-2">
                  <Link
                    href="/"
                    onClick={handleClose}
                    className="group between p-2 rounded-lg hover:bg-gray-light dark:hover:bg-darkBorder/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-9 center rounded-lg bg-gray-light dark:bg-cat-indigo/10 text-text6 dark:text-cat-indigo ring-1 ring-cat-indigo-light dark:ring-cat-indigo/20  transition-transform group-hover:scale-105">
                        <FileText className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text6 dark:text-border group-hover:text-cat-indigo-dark dark:group-hover:text-cat-indigo transition-colors">
                          Manage Products
                        </span>
                        <span className="text-xs text-text5 dark:text-text4">
                          View and edit your store inventory
                        </span>
                      </div>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-2 pr-2">
                      <span className="text-xs text-text4 dark:text-text5">
                        Jump to
                      </span>
                      <ChevronRight className="h-4 w-4 text-cat-indigo" />
                    </div>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={handleClose}
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-light dark:hover:bg-darkBorder/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-9 center rounded-lg bg-gray-light dark:bg-cat-indigo/10 text-text6 dark:text-cat-indigo ring-1 ring-cat-indigo-light dark:ring-cat-indigo/20  transition-transform group-hover:scale-105">
                        <Settings className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text6 dark:text-border group-hover:text-black dark:group-hover:text-white transition-colors">
                          Dashboard Settings
                        </span>
                        <span className="text-xs text-text5 dark:text-text4">
                          System configurations and preferences
                        </span>
                      </div>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-2 pr-2">
                      <span className="text-xs font-medium text-text4 dark:text-text5">
                        Jump to
                      </span>
                      <ChevronRight className="h-4 w-4 text-text4" />
                    </div>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={handleClose}
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-light dark:hover:bg-darkBorder/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-9 center rounded-lg bg-gray-light dark:bg-cat-amber/10 text-text6 dark:text-cat-amber ring-1 ring-cat-amber-light dark:ring-cat-amber/20  transition-transform group-hover:scale-105">
                        <ShoppingCart className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text6 dark:text-border group-hover:text-cat-amber-dark dark:group-hover:text-cat-amber transition-colors">
                          Manage Orders
                        </span>
                        <span className="text-xs text-text5 dark:text-text4">
                          View and track recent purchases
                        </span>
                      </div>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-2 pr-2">
                      <span className="text-xs font-medium text-text4 dark:text-text5">
                        Jump to
                      </span>
                      <ChevronRight className="h-4 w-4 text-cat-amber" />
                    </div>
                  </Link>

                  <Link
                    href="/customers"
                    onClick={handleClose}
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-light dark:hover:bg-darkBorder/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-9 center rounded-lg bg-gray-light dark:bg-cat-cyan/10 text-text6 dark:text-cat-cyan ring-1 ring-cat-cyan-light dark:ring-cat-cyan/20  transition-transform group-hover:scale-105">
                        <Users className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text6 dark:text-border group-hover:text-cat-cyan-dark dark:group-hover:text-cat-cyan transition-colors">
                          Customer Directory
                        </span>
                        <span className="text-xs text-text5 dark:text-text4">
                          Manage users and customer profiles
                        </span>
                      </div>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-2 pr-2">
                      <span className="text-xs font-medium text-text4 dark:text-text5">
                        Jump to
                      </span>
                      <ChevronRight className="h-4 w-4 text-cat-cyan" />
                    </div>
                  </Link>
                </div>

                <div className="px-2 py-1 text-[10px] font-medium text-text4 dark:text-text5 uppercase pt-4 tracking-widest border-t border-border dark:border-darkBorder">
                  Actions
                </div>
                <div className="space-y-1 mt-2">
                  <button
                    onClick={handleClose}
                    className="w-full text-left group between p-2 rounded-lg hover:bg-gray-light dark:hover:bg-darkBorder/50 transition-colors cursor-pointer outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-9 center rounded-lg bg-gray-light dark:bg-cat-emerald/10 text-text6 dark:text-cat-emerald ring-1 ring-cat-emerald-light dark:ring-cat-emerald/20  transition-transform group-hover:scale-105">
                        <User className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text6 dark:text-border group-hover:text-cat-emerald-dark dark:group-hover:text-cat-emerald transition-colors">
                          Create New User
                        </span>
                        <span className="text-xs text-text5 dark:text-text4">
                          Add a new admin to your workspace
                        </span>
                      </div>
                    </div>
                    <div className="hidden group-hover:flex items-center pr-2">
                      <Command className="h-4 w-4 text-cat-emerald" />
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border dark:border-darkBorder bg-gray-light/80 dark:bg-darkPrimary/50 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-text5 dark:text-text4">
              <span className="hidden sm:flex items-center gap-1.5">
                <kbd className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-white dark:bg-darkBorder border border-border dark:border-darkBorder font-sans font-medium text-[12px] text-text5">
                  ↑↓
                </kbd>
                to navigate
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <kbd className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-white dark:bg-darkBorder border border-border dark:border-darkBorder font-sans font-bold text-[12px] text-text5">
                  <CornerDownLeft className="size-3" />
                </kbd>
                to select
              </span>
            </div>
            <span className="text-xs text-text4 flex items-center gap-1.5">
              Search by{" "}
              <span className="font-semibold text-text6 dark:text-text4">
                Retwho
              </span>
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
