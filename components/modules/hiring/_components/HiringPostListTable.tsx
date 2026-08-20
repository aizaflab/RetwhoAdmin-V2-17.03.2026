"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Users,
  Trash2,
  Eye,
  Archive,
  Globe,
  FileEdit,
  FileText,
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

import {
  HIRING_EXPIRY_FILTER_OPTIONS,
  HIRING_STATUS_FILTER_OPTIONS,
  employmentTypeLabel,
  formatSalaryRange,
  hiringStatusStyle,
} from "../_data/hiring-options";
import HiringViewDialog from "./HiringViewDialog";
import type { HiringPost, HiringStatus } from "../_types/hiring.types";

interface HiringPostListTableProps {
  posts: HiringPost[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filters / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  /** "all" | "true" | "false" — sent to the API as `isExpired`. */
  expiryFilter: string;
  onExpiryFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  /** Assignable categories from `GET /hiring/categories/options`. */
  categoryOptions: { label: string; value: string }[];
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onUpdateStatus?: (
    post: HiringPost,
    status: HiringStatus,
  ) => Promise<void> | void;
  onViewApplications?: (post: HiringPost) => void;
  onDelete?: (post: HiringPost) => Promise<void> | void;
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

export default function HiringPostListTable({
  posts,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  expiryFilter,
  onExpiryFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onUpdateStatus,
  onViewApplications,
  onDelete,
  deleting,
}: HiringPostListTableProps) {
  const router = useRouter();

  const [postToDelete, setPostToDelete] = useState<HiringPost | null>(null);
  const [postToView, setPostToView] = useState<HiringPost | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const categoryFilterOptions = [
    { value: "all", label: "All Categories" },
    ...categoryOptions,
  ];

  const columns: Column<HiringPost>[] = [
    {
      id: "title",
      header: "Posting",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
            {row.companyLogo?.url ? (
              <Image
                src={row.companyLogo.url}
                alt={row.companyName}
                className="w-full h-full object-contain p-1"
                width={80}
                height={80}
                unoptimized
              />
            ) : (
              <Building2 className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="max-w-50 sm:max-w-xs">
            <p className="text-sm font-semibold text-foreground truncate">
              {row.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground truncate">
                {row.companyName}
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {row.category?.title || "Uncategorised"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "city",
      header: "Location",
      className: "hidden lg:table-cell",
      cell: (value, row) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {[row.city, row.country].filter(Boolean).join(", ") || "—"}
          </span>
        </div>
      ),
    },
    {
      id: "salaryMin",
      header: "Salary",
      className: "hidden xl:table-cell",
      cell: (value, row) => (
        <div className="text-sm text-foreground">
          <p>
            {formatSalaryRange(
              row.salaryMin,
              row.salaryMax,
              row.currency,
              row.salaryType,
            )}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {employmentTypeLabel(row.employmentType)}
          </p>
        </div>
      ),
    },
    {
      id: "applicationStats",
      header: "Applicants",
      className: "text-center",
      cell: (value, row) => {
        const stats = row.applicationStats;
        const totalApps = stats?.total ?? 0;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewApplications?.(row);
            }}
            disabled={!onViewApplications}
            className="inline-flex flex-col items-center gap-0.5 disabled:cursor-default enabled:cursor-pointer"
          >
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                totalApps > 0 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Users className="size-3.5" />
              {totalApps}
            </span>
            {/* The queue that needs work, not just the headline count. */}
            {(stats?.pending ?? 0) > 0 && (
              <span className="text-[10px] font-medium text-warning">
                {stats?.pending} pending
              </span>
            )}
          </button>
        );
      },
    },
    {
      id: "applicationDeadline",
      header: "Deadline",
      className: "hidden md:table-cell",
      cell: (value, row) => (
        <div className="text-sm">
          <span className="text-muted-foreground">
            {formatDate(row.applicationDeadline)}
          </span>
          {/* Still advertised, but nobody can apply any more. Derived by the
              API as `isExpired`, so the badge and the Expired filter agree. */}
          {row.isExpired && (
            <p className="text-[10px] font-medium text-destructive mt-0.5">
              past deadline
            </p>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, row) => (
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${hiringStatusStyle(
            row.status,
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof HiringPost,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, row) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/hiring/edit/${row._id}`);
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
              {/* The posting itself, before the people who answered it. */}
              <DropdownItem
                icon={<FileText className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setPostToView(row);
                }}
                className="text-foreground text-xs rounded-sm py-2 cursor-pointer"
              >
                View Hiring
              </DropdownItem>

              {onViewApplications && (
                <DropdownItem
                  icon={<Eye className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewApplications(row);
                  }}
                  className="text-foreground text-xs rounded-sm py-2 cursor-pointer"
                >
                  View Applications
                </DropdownItem>
              )}

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
                  {row.status !== "closed" && (
                    <DropdownItem
                      icon={<Archive className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "closed");
                      }}
                      className="text-muted-foreground text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Close Posting
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
                  setPostToDelete(row);
                }}
                className="text-xs rounded-sm py-2 cursor-pointer"
              >
                Delete Posting
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
        <h3 className="text-xl font-medium text-foreground">All Postings</h3>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Search — matches title, company and location server-side. */}
          <div className="relative flex-1 md:w-56 min-w-50">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search postings..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>

          <div className="relative w-36">
            <SimpleSelect
              options={categoryFilterOptions}
              value={categoryFilter}
              onChange={onCategoryFilterChange}
              className="h-10 rounded-md bg-card"
            />
          </div>

          <div className="relative w-28">
            <SimpleSelect
              options={HIRING_STATUS_FILTER_OPTIONS.map((o) => ({
                value: String(o.value),
                label: o.label,
              }))}
              value={statusFilter}
              onChange={onStatusFilterChange}
              className="h-10 rounded-md bg-card"
            />
          </div>

          {/* Separate from status on purpose: an expired posting is still
              `published`, so this narrows by deadline rather than by state. */}
          <div className="relative w-32">
            <SimpleSelect
              options={HIRING_EXPIRY_FILTER_OPTIONS.map((o) => ({
                value: String(o.value),
                label: o.label,
              }))}
              value={expiryFilter}
              onChange={onExpiryFilterChange}
              className="h-10 rounded-md bg-card"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<HiringPost>
        data={posts}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        totalData={total}
        bordered
        emptyMessage="No postings found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
      />

      {/* View */}
      <HiringViewDialog
        open={!!postToView}
        post={postToView}
        onClose={() => setPostToView(null)}
        onEdit={(post) => {
          setPostToView(null);
          router.push(`/hiring/edit/${post._id}`);
        }}
        onViewApplications={
          onViewApplications
            ? (post) => {
                setPostToView(null);
                onViewApplications(post);
              }
            : undefined
        }
      />

      {/* Delete Confirmation Modal. The API archives the posting rather than
          removing it, and leaves its applications and images alone. */}
      <DeleteModal
        title="Delete Posting"
        text={
          (postToDelete?.applicationStats?.total ?? 0) > 0
            ? `Delete "${postToDelete?.title}"? It will be archived and hidden from the panel; its ${postToDelete?.applicationStats?.total} application(s) stay intact.`
            : `Delete "${postToDelete?.title}"? It will be archived and hidden from the panel.`
        }
        deleteModal={!!postToDelete}
        setDeleteModal={(open) => {
          if (!open) setPostToDelete(null);
        }}
        selectedRow={postToDelete}
        isLoading={deleting}
        handleDelete={async (row) => {
          if (!row) return;
          await onDelete?.(row);
          setPostToDelete(null);
        }}
      />
    </div>
  );
}
