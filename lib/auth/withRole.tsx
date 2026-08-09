"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";

interface WithRoleOptions {
  allowedRoles: string[];
  redirectTo?: string;
}

export function withRole<P extends object>(
  Component: ComponentType<P>,
  options: WithRoleOptions,
) {
  return function RoleProtectedRoute(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { allowedRoles, redirectTo = "/" } = options;

    const role = session?.user?.role;
    const hasRole = Boolean(role && allowedRoles.includes(role));

    useEffect(() => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.replace("/login");
      } else if (!hasRole) {
        router.replace(redirectTo);
      }
    }, [status, hasRole, router, redirectTo]);

    if (status === "loading") {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"></div>
        </div>
      );
    }

    if (status === "unauthenticated" || !hasRole) {
      return null;
    }

    return <Component {...props} />;
  };
}
