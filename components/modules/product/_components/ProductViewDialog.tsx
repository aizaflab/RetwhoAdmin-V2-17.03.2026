"use client";

import { useState } from "react";
import Image from "next/image";
import { Package2, Tag as TagIcon } from "lucide-react";

import { Dialog } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { useGetProductQuery } from "@/featured/product/productApiSlice";

import type { GlobalProduct } from "../_types/product.types";

interface ProductViewDialogProps {
  open: boolean;
  onClose: () => void;
  /** The row that was clicked — its id drives the fetch. */
  product?: GlobalProduct | null;
  onEdit?: (product: GlobalProduct) => void;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm wrap-break-word text-foreground">{value}</span>
    </div>
  );
}

/** Read-only product record, fetched fresh by id when the dialog opens. */
export default function ProductViewDialog({
  open,
  onClose,
  product,
  onEdit,
}: ProductViewDialogProps) {
  // The caller clears its selection the moment the dialog closes. Hold on to
  // the last product so there is still content to show while it fades out.
  const [lastProduct, setLastProduct] = useState(product);
  if (product && product !== lastProduct) setLastProduct(product);

  const row = product ?? lastProduct;

  const { data, isFetching, isError } = useGetProductQuery(row?._id ?? "", {
    skip: !open || !row?._id,
  });

  if (!row) return null;

  // The row already carries most of what is shown, so the dialog paints
  // immediately and the fetched record replaces it once it lands.
  const shown: GlobalProduct = data ?? row;
  const tags = shown.tags ?? [];
  const profit = shown.profit;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xlarge"
      title="Product Details"
      description="A read-only view of this product's record."
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(shown)}>Edit Product</Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Identity header — scope sits opposite the name, the way the list
            row reads. */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-linear-to-r from-primary/5 to-transparent p-4">
          {shown.image?.url ? (
            <Image
              src={shown.image.url}
              alt={shown.name}
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-xl object-cover ring-2 ring-primary/20"
              unoptimized
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/20">
              <Package2 className="h-7 w-7 text-primary" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">
              {shown.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {shown.description || "No description"}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              shown.isGlobal
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {shown.isGlobal ? "Global" : "Private"}
          </span>
        </div>

        {/* Only the fields the list does not already show are worth a
            placeholder; the rest came in with the row. */}
        {isError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Could not load the latest details. Showing what the list returned.
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="UPC" value={shown.upc || "—"} />
          <DetailRow label="Box UPC" value={shown.boxUpc || "—"} />
          <DetailRow
            label="Profit"
            value={
              profit?.enabled ? (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {profit.percentage}%
                </span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )
            }
          />
          <DetailRow
            label="Wholesale"
            value={
              shown.wholesaleConfig?.noProfit ? "No profit" : "Profit applied"
            }
          />
          <DetailRow
            label="Created At"
            value={
              isFetching && !data ? (
                <Skeleton shape="text" className="h-4 w-32" />
              ) : (
                formatDate(shown.createdAt)
              )
            }
          />
          <DetailRow
            label="Last Updated"
            value={
              isFetching && !data ? (
                <Skeleton shape="text" className="h-4 w-32" />
              ) : (
                formatDate(shown.updatedAt)
              )
            }
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <span className="text-xs font-medium text-muted-foreground">
            Tags {tags.length > 0 && `(${tags.length})`}
          </span>
          {tags.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted-foreground">No tags</p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium text-foreground"
                >
                  <TagIcon className="h-2.5 w-2.5 shrink-0 text-primary" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
