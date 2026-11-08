"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  PermissionGuard,
  useCurrentAccess,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { WholesalerCommissionView } from "@/components/modules/commission";

function WholesalerCommission() {
  const { shopId } = useParams<{ shopId: string }>();
  const month = useSearchParams().get("month") ?? "";

  return (
    <WholesalerCommissionView
      shopId={shopId}
      initialMonth={month}
      backHref="/setting/commission/collection"
    />
  );
}

export default function WholesalerCommissionPage() {
  const user = useCurrentAccess();

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.ADMIN_SETTINGS_VIEW]}
    >
      <div className="min-h-[calc(100dvh-93px)] rounded-lg border border-border/70 bg-card p-3 sm:min-h-[calc(100dvh-109px)] sm:p-5">
        <Suspense>
          <WholesalerCommission />
        </Suspense>
      </div>
    </PermissionGuard>
  );
}
