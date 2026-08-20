"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Image as ImageIcon,
  Trash2,
  Eye,
  Globe,
  FileEdit,
  Archive,
} from "lucide-react";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Input, SimpleSelect } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "@/components/ui/dropdown/Dropdown";
import { SearchIcon, EditIcon, MoreIcon } from "@/components/icons/Icons";

import PromotionViewDrawer from "./PromotionViewDrawer";
import {
  PHASE_LABELS,
  PHASE_STYLES,
  PROMOTION_STATUS_FILTER_OPTIONS,
  PROMOTION_TYPE_FILTER_OPTIONS,
  audienceLabel,
  promotionPhase,
  promotionStatusStyle,
  promotionTypeLabel,
} from "../_data/promotion-options";
import type { Promotion, PromotionStatus } from "../_types/promotion.types";

interface PromotionListTableProps {
  promotions: Promotion[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filters / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onUpdateStatus?: (
    promotion: Promotion,
    status: PromotionStatus,
  ) => Promise<void> | void;
  onDelete?: (promotion: Promotion) => Promise<void> | void;
  deleting?: boolean;
}

const ACTION_BUTTON =
  "cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground transition-all duration-150";

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export default function PromotionListTable({
  promotions,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onUpdateStatus,
  onDelete,
  deleting,
}: PromotionListTableProps) {
  const router = useRouter();

  const [viewing, setViewing] = useState<Promotion | null>(null);
  const [toDelete, setToDelete] = useState<Promotion | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const columns: Column<Promotion>[] = [
    {
      id: "title",
      header: "Campaign",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
            {row.bannerImage?.url ? (
              <Image
                src={row.bannerImage.url}
                alt={row.bannerImage.alt || row.title}
                className="w-full h-full object-cover"
                width={96}
                height={96}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="max-w-50 sm:max-w-xs">
            <p className="text-sm font-semibold text-foreground truncate">
              {row.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
                {promotionTypeLabel(row.promotionType)}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {row.wholesaler?.companyName || "Platform-wide"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "targetAudience",
      header: "Audience",
      className: "hidden lg:table-cell",
      cell: (value, row) => (
        <div className="flex flex-wrap gap-1">
          {(row.targetAudience ?? []).length > 0 ? (
            row.targetAudience.map((audience) => (
              <span
                key={audience}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {audienceLabel(audience)}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      id: "startDate",
      header: "Runs",
      className: "hidden md:table-cell",
      cell: (value, row) => {
        // The dates say whether it is on screen; the status only says whether
        // it was approved, so both are shown together.
        const phase = promotionPhase(row);
        return (
          <div className="text-sm">
            <span className="text-muted-foreground">
              {formatDate(row.startDate)} → {formatDate(row.endDate)}
            </span>
            <p className="mt-0.5">
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${PHASE_STYLES[phase]}`}
              >
                {PHASE_LABELS[phase]}
              </span>
            </p>
          </div>
        );
      },
    },
    {
      id: "priority",
      header: "Priority",
      className: "text-center hidden xl:table-cell",
      cell: (value, row) => (
        <span className="text-sm font-medium text-foreground">
          {row.priority ?? 0}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, row) => (
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${promotionStatusStyle(
            row.status,
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof Promotion,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, row) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/promotion/edit/${row._id}`);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) =>
              setOpenDropdownId(isOpen ? row._id : null)
            }
          >
            <SimpleTooltip
              content="More"
              position="top"
              disabled={openDropdownId === row._id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className={`${ACTION_BUTTON} hover:border-destructive/50 hover:text-destructive`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreIcon className="w-4 h-4" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="right" className="min-w-40 p-1 font-medium">
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewing(row);
                }}
                className="text-foreground text-xs rounded-sm py-2 cursor-pointer"
              >
                View Details
              </DropdownItem>

              {onUpdateStatus && (
                <>
                  <DropdownSeparator />
                  <DropdownLabel className="text-[9px] items-center gap-1.5 uppercase tracking-wider text-muted-foreground py-1.5 pb-2 pl-0 flex">
                    Status Actions
                  </DropdownLabel>
                  {row.status !== "published" && (
                    <DropdownItem
                      icon={<Globe className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "published");
                      }}
                      className="text-success text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Publish
                    </DropdownItem>
                  )}
                  {row.status !== "draft" && (
                    <DropdownItem
                      icon={<FileEdit className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "draft");
                      }}
                      className="text-warning text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Revert to Draft
                    </DropdownItem>
                  )}
                  {row.status !== "archived" && (
                    <DropdownItem
                      icon={<Archive className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "archived");
                      }}
                      className="text-muted-foreground text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Move to Archive
                    </DropdownItem>
                  )}
                </>
              )}

              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 className="size-3.5" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setToDelete(row);
                }}
                className="text-xs rounded-sm py-2 cursor-pointer"
              >
                Delete Promotion
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
        <h3 className="text-xl font-medium text-foreground">All Campaigns</h3>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Search — matches title, slug and description server-side. */}
          <div className="relative flex-1 md:w-56 min-w-50">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search campaigns..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>

          <div className="relative w-32">
            <SimpleSelect
              options={PROMOTION_TYPE_FILTER_OPTIONS.map((o) => ({
                value: String(o.value),
                label: o.label,
              }))}
              value={typeFilter}
              onChange={onTypeFilterChange}
              className="h-10 rounded-md bg-card"
            />
          </div>

          <div className="relative w-32">
            <SimpleSelect
              options={PROMOTION_STATUS_FILTER_OPTIONS.map((o) => ({
                value: String(o.value),
                label: o.label,
              }))}
              value={statusFilter}
              onChange={onStatusFilterChange}
              className="h-10 rounded-md bg-card"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<Promotion>
        data={promotions}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        totalData={total}
        bordered
        emptyMessage="No campaigns found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
      />

      {/* View */}
      <PromotionViewDrawer
        open={!!viewing}
        promotion={viewing}
        onClose={() => setViewing(null)}
        onEdit={(promotion) => {
          setViewing(null);
          router.push(`/promotion/edit/${promotion._id}`);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Promotion"
        text={`Delete "${toDelete?.title}"? The promotion will be archived and hidden from the panel.`}
        deleteModal={!!toDelete}
        setDeleteModal={(open) => {
          if (!open) setToDelete(null);
        }}
        selectedRow={toDelete}
        isLoading={deleting}
        handleDelete={async (row) => {
          if (!row) return;
          await onDelete?.(row);
          setToDelete(null);
        }}
      />
    </div>
  );
}
