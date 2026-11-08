"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  PermissionGuard,
  useCurrentAccess,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import {
  PlatformSettingsForm,
  type PlatformSettingsPayload,
} from "@/components/modules/platform-settings";
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from "@/featured/platform-settings/platformSettingsApiSlice";
import { useGetWholesalerCommissionStatsQuery } from "@/featured/wholesaler-commission/wholesalerCommissionApiSlice";
import { getApiErrorMessage } from "@/lib/apiError";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";

export default function CommissionSettingsPage() {
  const user = useCurrentAccess();
  const {
    data: settings,
    isLoading,
    isError,
    error,
  } = useGetPlatformSettingsQuery();
  const [update, { isLoading: saving }] = useUpdatePlatformSettingsMutation();
  const { data: commissionStats } =
    useGetWholesalerCommissionStatsQuery(undefined);

  const handleSave = async (payload: PlatformSettingsPayload) => {
    try {
      await update(payload).unwrap();
      toast.success("Rates saved. New orders use them from now on.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save the rates."));
    }
  };

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.ADMIN_SETTINGS_VIEW]}
    >
      <div className="min-h-[calc(100dvh-93px)] rounded-lg border border-border/70 bg-card p-3 sm:min-h-[calc(100dvh-109px)] sm:p-5">
        <div className="mb-5">
          <h1 className="text-xl font-medium sm:text-2xl">
            Commission &amp; Fees
          </h1>
          <p className="text-sm text-muted-foreground">
            Retwho&apos;s commission on wholesaler orders, and the fee a
            retailer pays on top when paying online.
          </p>
          {!!commissionStats?.customRates && (
            <p className="mt-1 text-sm text-muted-foreground">
              {commissionStats.customRates} wholesaler
              {commissionStats.customRates === 1
                ? " has its"
                : "s have their"}{" "}
              own commission and{" "}
              {commissionStats.customRates === 1 ? "is" : "are"} not charged the
              global one —{" "}
              <Link
                href="/setting/wholesaler-commission"
                className="font-medium text-primary hover:underline"
              >
                Wholesaler Commission
              </Link>
              .
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ) : isError || !settings ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(error, "Could not load the rates.")}
          </p>
        ) : (
          <PlatformSettingsForm
            // Fresh state once the saved rates come back.
            key={settings.updatedAt ?? "initial"}
            settings={settings}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
