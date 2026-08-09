"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";

/**
 * Client-side guard. `middleware.ts` already blocks unauthenticated requests
 * before they render; this is a second line of defence for a session that
 * expires while the tab is open.
 */
export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "unauthenticated") {
        router.replace("/login");
      }
    }, [status, router]);

    if (status === "loading") {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"></div>
        </div>
      );
    }

    if (status === "unauthenticated") {
      return null;
    }

    return <Component {...props} />;
  };
}
