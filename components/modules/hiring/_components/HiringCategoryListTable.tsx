"use client";

import { useState } from "react";
import { FolderTree } from "lucide-react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  DeleteIcon,
} from "@/components/icons/Icons";

import HiringCategoryModal from "./HiringCategoryModal";
import {
  CATEGORY_STATUS_FILTER_OPTIONS,
  hiringCategoryStatusStyle,
} from "../_data/hiring-options";
import type {
  HiringCategory,
  HiringCategoryPayload,
} from "../_types/hiring.types";

interface HiringCategoryListTableProps {
  categories: HiringCategory[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filter / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  /** Create when no id is given, update when there is one. */
  onSaveCategory: (
    payload: HiringCategoryPayload,
    id?: string,
  ) => Promise<unknown>;
  savingCategory?: boolean;
  onDelete?: (category: HiringCategory) => Promise<void> | void;
  deleting?: boolean;
}

const ACTION_BUTTON =
  "cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground transition-all duration-150";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

/**
 * Why the row's delete button is off — empty string means it is available.
 * Mirrors the API guard exactly: a category holding postings is refused with a
 * 409, because every one of those postings would be left pointing at a
 * category no query can resolve. An empty category is archived instead.
 */
function deleteBlockedReason(category: HiringCategory): string {
  const count = category.postCount ?? 0;

  if (count > 0) {
    return `Holds ${count} post${count === 1 ? "" : "s"}`;
  }

  return "";
}

export default function HiringCategoryListTable({
  categories,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onSaveCategory,
  savingCategory,
  onDelete,
  deleting,
}: HiringCategoryListTableProps) {
  const [categoryToDelete, setCategoryToDelete] =
    useState<HiringCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<HiringCategory | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const statusOptions = CATEGORY_STATUS_FILTER_OPTIONS.map((o) => ({
    value: String(o.value),
    label: o.label,
  }));

  const columns: Column<HiringCategory>[] = [
    {
      id: "title",
      header: "Category",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
            <FolderTree className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{row.title}</p>
            <p className="text-[10px] text-muted-foreground">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "postCount",
      header: "Postings",
      className: "text-center",
      cell: (value, row) => (
        <div className="text-sm">
          <span className="font-semibold text-foreground">
            {row.postCount ?? 0}
          </span>
          {/* How much of the category is actually reachable by the public. */}
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {row.publishedPostCount ?? 0} live
          </p>
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Created Date",
      className: "text-left hidden sm:table-cell",
      cell: (value, row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, row) => (
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${hiringCategoryStatusStyle(
            row.status,
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof HiringCategory,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, row) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingCategory(row);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          {/* The API refuses to delete a category that still holds postings,
              so the button says why before it is clicked. */}
          <SimpleTooltip
            content={deleteBlockedReason(row) || "Delete"}
            position="top"
          >
            <button
              disabled={!!deleteBlockedReason(row)}
              onClick={(e) => {
                e.stopPropagation();
                setCategoryToDelete(row);
              }}
              className={`${ACTION_BUTTON} enabled:hover:border-destructive/50 enabled:hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <DeleteIcon className="w-4 h-4" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h3 className="text-xl font-medium text-foreground">Categories</h3>
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <div className="relative w-full sm:w-auto min-w-50 flex-1">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search category..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>

          <div className="relative w-32">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-10 rounded-md bg-card">
                <SelectValue options={statusOptions} placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={statusOptions} />
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 h-10 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table<HiringCategory>
        data={categories}
        columns={columns}
        loading={loading}
        pagination
        totalData={total}
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        bordered
        emptyMessage="No categories found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingCategory) && (
        <HiringCategoryModal
          category={editingCategory}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={onSaveCategory}
          saving={savingCategory}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Category"
        text={`Delete the category "${categoryToDelete?.title}"? It holds no posts, so it will be archived and hidden from the panel.`}
        deleteModal={!!categoryToDelete}
        setDeleteModal={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        selectedRow={categoryToDelete}
        isLoading={deleting}
        handleDelete={async (row) => {
          if (!row) return;
          await onDelete?.(row);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
