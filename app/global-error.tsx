"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-black dark:text-white">
                Application Error
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                A critical error occurred. Please try again.
              </p>
              {error.digest && (
                <p className="text-sm text-zinc-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <button
              onClick={reset}
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
