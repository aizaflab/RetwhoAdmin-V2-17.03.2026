"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GlobalProduct } from "../_types/product.types";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import ProductViewDialog from "./ProductViewDialog";
import { Input } from "@/components/ui/input/Input";
import {
  SCOPE_FILTER_OPTIONS,
  SORT_OPTIONS,
} from "../_data/product-list-options";
import {
  Table,
  Column,
  type TableEmptyAction,
} from "@/components/ui/table/Table";
import { cn } from "@/lib/utils";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Edit2,
  Trash2,
  Eye,
  Tag as TagIcon,
  Package2,
  PackageSearch,
  RefreshCw,
  FilterX,
  Plus,
} from "lucide-react";
import { SearchIcon } from "@/components/icons/Icons";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItems,
} from "@/components/ui/select/Select";

/**
 * Tags cell budget, in px. A fixed chip count truncated every tag down to
 * "new…", which says nothing — so the chips are picked by how much room they
 * actually take, and whatever is left over goes behind "+N more". Estimates,
 * not measurements: close enough at this font size, and no layout pass.
 */
const TAG_ROW_WIDTH = 170;
const TAG_CHAR_WIDTH = 6;
/** Tag icon, padding and the gap after the chip. */
const TAG_CHIP_CHROME = 28;
/** Room the "+N more" pill needs. */
const TAG_MORE_WIDTH = 60;

/** The chips that fit; always at least one, however long that tag is. */
function fitTags(tags: string[]): string[] {
  const shown: string[] = [];
  let used = 0;

  for (const tag of tags) {
    const width = tag.length * TAG_CHAR_WIDTH + TAG_CHIP_CHROME;
    // Only leave room for the counter while tags would still be left over.
    const reserve = shown.length + 1 < tags.length ? TAG_MORE_WIDTH : 0;
    if (shown.length > 0 && used + width + reserve > TAG_ROW_WIDTH) break;
    shown.push(tag);
    used += width;
  }

  return shown;
}

/** Every row action is the same square icon button; only the hover tint differs. */
const ACTION_BUTTON =
  "cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 transition-all duration-150";

const ACTION_HOVER = {
  neutral: "hover:border-border hover:bg-muted hover:text-foreground",
  primary: "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
  destructive:
    "hover:border-rose-400/50 hover:bg-rose-50 dark:hover:bg-rose-400/10 hover:text-rose-500",
};

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

interface ProductListTableProps {
  products: GlobalProduct[];
  title: string;
  loading?: boolean;
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  scopeFilter: string;
  onScopeFilterChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onRefresh?: () => void;
}

export default function ProductListTable({
  products,
  title,
  loading = false,
  total,
  search,
  onSearchChange,
  scopeFilter,
  onScopeFilterChange,
  sort,
  onSortChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onRefresh,
}: ProductListTableProps) {
  const router = useRouter();
  const [productToDelete, setProductToDelete] = useState<GlobalProduct | null>(
    null,
  );
  const [productToView, setProductToView] = useState<GlobalProduct | null>(
    null,
  );

  console.log(products);

  const columns: Column<GlobalProduct>[] = [
    {
      id: "name",
      header: "Product Details",
      cell: (value, product) => (
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0 overflow-hidden border border-primary/20">
            {product.image?.url ? (
              <Image
                src={product.image.url}
                alt={product.name}
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <Package2 className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="max-w-45 sm:max-w-65">
            <p
              className="text-sm font-semibold line-clamp-1"
              title={product.name}
            >
              {product.name}
            </p>
            <p
              className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1"
              title={product.description}
            >
              {product.description || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "upc",
      header: "Barcodes",
      className: "hidden sm:table-cell",
      cell: (value, product) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-medium text-black dark:text-white">
            <span className="text-text5 mr-1 font-normal">UPC:</span>
            {product.upc}
          </span>
          <span className="text-[11px] text-text5">
            Box: {product.boxUpc || "—"}
          </span>
        </div>
      ),
    },
    {
      id: "profit",
      header: "Profit",
      cell: (value, product) =>
        product.profit?.enabled ? (
          <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
            {product.profit.percentage}%
          </span>
        ) : (
          <span className="text-[11px] text-text5">Disabled</span>
        ),
    },
    {
      id: "isGlobal",
      header: "Scope",
      className: "hidden lg:table-cell",
      cell: (value, product) => (
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            product.isGlobal
              ? "bg-primary/10 text-primary"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {product.isGlobal ? "Global" : "Private"}
        </span>
      ),
    },
    {
      id: "tags",
      header: "Tags",
      className: "hidden md:table-cell",
      cell: (value, product) => {
        const tags = product.tags ?? [];
        if (tags.length === 0)
          return <span className="text-[11px] text-text5">—</span>;

        const shown = fitTags(tags);
        const hidden = tags.length - shown.length;

        return (
          // The row is nowrap, so the chips have to be held inside a fixed
          // width themselves — otherwise a long tag or the +N counter spills
          // over into the next column.
          <SimpleTooltip
            position="top"
            contentClassName="max-w-70 p-2.5"
            content={
              // The bubble is `bg-muted`, so the chips need their own solid
              // surface and border to stay legible against it.
              <div className="space-y-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {tags.length} {tags.length === 1 ? "tag" : "tags"}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium text-foreground"
                    >
                      <TagIcon className="w-2.5 h-2.5 shrink-0 text-primary" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            }
          >
            <div className="flex w-42.5 items-center gap-1.5 overflow-hidden">
              {shown.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex min-w-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <TagIcon className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{t}</span>
                </span>
              ))}
              {hidden > 0 && (
                <span className="shrink-0 rounded-full px-1 py-0.5 text-[10px] font-medium text-text5">
                  +{hidden} more
                </span>
              )}
            </div>
          </SimpleTooltip>
        );
      },
    },
    {
      id: "createdAt",
      header: "Created",
      className: "hidden lg:table-cell",
      cell: (value, product) => (
        <span className="text-[12px] text-text5">
          {formatDate(product.createdAt)}
        </span>
      ),
    },
    {
      id: "actions" as keyof GlobalProduct,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, product) => (
        <div className="flex items-center justify-end gap-1.5 relative">
          <SimpleTooltip content="View Details" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProductToView(product);
              }}
              className={cn(ACTION_BUTTON, ACTION_HOVER.neutral)}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Edit Product" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/product/edit/${product._id}`);
              }}
              className={cn(ACTION_BUTTON, ACTION_HOVER.primary)}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Delete Product" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProductToDelete(product);
              }}
              className={cn(ACTION_BUTTON, ACTION_HOVER.destructive)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  const isFiltered = search.trim().length > 0 || scopeFilter !== "all";

  const emptyActions: TableEmptyAction[] = [
    ...(isFiltered
      ? [
          {
            label: "Clear filters",
            icon: <FilterX className="size-4" />,
            onClick: () => {
              onSearchChange("");
              onScopeFilterChange("all");
            },
          },
        ]
      : [
          {
            label: "Add product",
            variant: "default" as const,
            icon: <Plus className="size-4" />,
            onClick: () => router.push("/product/add"),
          },
        ]),
    ...(onRefresh
      ? [
          {
            label: "Reload",
            icon: (
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            ),
            onClick: onRefresh,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-xl border border-border/50 bg-card text-card-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <h3 className="sm:text-2xl text-xl font-medium">{title}</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80 dark:focus:border-darkLight/50"
            />
          </div>

          <div className="relative sm:w-32">
            <Select value={scopeFilter} onValueChange={onScopeFilterChange}>
              <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                <SelectValue
                  options={SCOPE_FILTER_OPTIONS}
                  placeholder="All scopes"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={SCOPE_FILTER_OPTIONS} />
              </SelectContent>
            </Select>
          </div>

          <div className="relative sm:w-40">
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                <SelectValue options={SORT_OPTIONS} placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={SORT_OPTIONS} />
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Table<GlobalProduct>
        data={products}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        totalData={total}
        bordered
        emptyIcon={
          isFiltered ? (
            <PackageSearch className="size-6" />
          ) : (
            <Package2 className="size-6" />
          )
        }
        emptyMessage={isFiltered ? "No matching products" : "No products yet"}
        emptyDescription={
          isFiltered
            ? "No product matches your current search or filters. Try a different keyword, or clear the filters to see the full list."
            : "Products you create will show up here with their barcodes, pricing and tags."
        }
        emptyActions={emptyActions}
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      <ProductViewDialog
        open={!!productToView}
        onClose={() => setProductToView(null)}
        product={productToView}
        onEdit={(product) => router.push(`/product/edit/${product._id}`)}
      />

      <DeleteModal
        title="Delete Product?"
        text={`Are you sure you want to delete the product "${productToDelete?.name}"? This action cannot be undone.`}
        deleteModal={!!productToDelete}
        setDeleteModal={(open) => {
          if (!open) setProductToDelete(null);
        }}
        selectedRow={productToDelete}
        handleDelete={(product) => {
          if (product) {
            console.log("Delete product", product._id);
            setProductToDelete(null);
          }
        }}
      />
    </div>
  );
}
