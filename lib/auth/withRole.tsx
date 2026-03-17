"use client";

import { useAuth } from "@/components/providers";
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
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { allowedRoles, redirectTo = "/" } = options;

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push("/login");
        } else if (user && !allowedRoles.includes(user.role)) {
          router.push(redirectTo);
        }
      }
    }, [isAuthenticated, isLoading, user, router, allowedRoles, redirectTo]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"></div>
        </div>
      );
    }

    if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
      return null;
    }

    return <Component {...props} />;
  };
}
