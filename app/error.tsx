"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 dark:bg-[#01030e]">
      {/* Soft radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="size-120 rounded-full bg-primary/8 blur-[120px] dark:bg-primary/12" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 text-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/6 shadow-sm dark:border-primary/25 dark:bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-9 w-9 text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Text block */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          {error.digest && (
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 font-mono text-xs text-gray-400 dark:bg-white/5 dark:text-gray-500">
              ref: {error.digest}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 sm:flex-row max-w-xs mx-auto">
          <button
            onClick={reset}
            className="flex-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#0055b0] hover:shadow-md active:scale-[0.98]"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md active:scale-[0.98] dark:border-white/10 dark:bg-white/4 dark:text-gray-300 dark:hover:bg-white/8"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
