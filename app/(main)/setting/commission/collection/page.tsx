"use client";

import {
  PermissionGuard,
  useCurrentAccess,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { CommissionStatementsView } from "@/components/modules/commission";

export default function CommissionCollectionPage() {
  const user = useCurrentAccess();

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.ADMIN_SETTINGS_VIEW]}
    >
      <div className="min-h-[calc(100dvh-93px)] rounded-lg border border-border/70 bg-card p-3 sm:min-h-[calc(100dvh-109px)] sm:p-5">
        <div className="mb-5">
          <h1 className="text-xl font-medium sm:text-2xl">
            Commission Collection
          </h1>
          <p className="text-sm text-muted-foreground">
            What every wholesaler owes in commission, month by month — ask for
            it and collect it.
          </p>
        </div>
        <CommissionStatementsView
          detailHref={(shopId, month) =>
            `/setting/commission/collection/${shopId}?month=${month}`
          }
        />
      </div>
    </PermissionGuard>
  );
}
