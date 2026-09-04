"use client";

import { use } from "react";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { BulkUploadDetails } from "@/components/modules/product";

export default function BulkUploadDetailsPage({
  params,
}: {
  params: Promise<{ idempotencyKey: string }>;
}) {
  const { idempotencyKey } = use(params);
  const user = useCurrentAccess();

  // Same gate as the upload page itself — this only reports on an import.
  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.PRODUCT_CREATE]}>
      <BulkUploadDetails idempotencyKey={idempotencyKey} />
    </PermissionGuard>
  );
}
