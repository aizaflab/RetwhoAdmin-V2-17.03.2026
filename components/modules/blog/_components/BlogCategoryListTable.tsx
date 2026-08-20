"use client";

import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  DeleteIcon,
  FlexTextIcon,
} from "@/components/icons/Icons";

import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui";
import {
  CATEGORY_STATUS_FILTER_OPTIONS,
  categoryStatusStyle,
} from "../_data/blog-options";
import { BlogCategory, BlogCategoryPayload } from "../_types/blog.types";
import BlogCategoryModal from "./BlogCategoryModal";
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

interface BlogCategoryListTableProps {
  categories: BlogCategory[];
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
    payload: BlogCategoryPayload,
    id?: string,
  ) => Promise<unknown>;
  savingCategory?: boolean;
  onDelete?: (category: BlogCategory) => Promise<void> | void;
  deleting?: boolean;
}

/**
 * Why the row's delete button is off — empty string means it is available.
 * Mirrors the API guard exactly: a category holding blogs is refused with a
 * 409, because every one of those blogs would be left pointing at a category
 * no query can resolve. An empty category is archived instead.
 */
function deleteBlockedReason(category: BlogCategory): string {
  const count = category.blogCount ?? 0;

  if (count > 0) {
    return `Holds ${count} blog${count === 1 ? "" : "s"}`;
  }

  return "";
}

export default function BlogCategoryListTable({
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
}: BlogCategoryListTableProps) {
  const [categoryToDelete, setCategoryToDelete] = useState<BlogCategory | null>(
    null,
  );
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const statusOptions = CATEGORY_STATUS_FILTER_OPTIONS.map((o) => ({
    value: String(o.value),
    label: o.label,
  }));

  const columns: Column<BlogCategory>[] = [
    {
      id: "title",
      header: "Category",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/20 shrink-0">
            <FlexTextIcon className="w-4 h-4 text-primary dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{row.title}</p>
            <p className="text-[10px] text-muted-foreground">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "blogCount",
      header: "Blogs",
      className: "text-center",
      cell: (value, row) => (
        <span className="text-sm font-semibold text-foreground">
          {row.blogCount ?? 0}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created Date",
      className: "text-left hidden sm:table-cell",
      cell: (value, row) => (
        <span className="text-sm text-foreground">
          {format(new Date(row.createdAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, row) => (
        <span
          className={` text-xs font-semibold px-2.5 w-18 center  py-1 rounded-full capitalize ${categoryStatusStyle(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof BlogCategory,
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
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

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
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground enabled:hover:border-destructive/50 enabled:hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-150"
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <h1 className="sm:text-2xl text-xl font-medium">Categories</h1>
        <div className="flex items-center gap-3 flex-wrap">
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
      <div className="">
        <Table<BlogCategory>
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
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingCategory) && (
        <BlogCategoryModal
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
        text={`Delete the category "${categoryToDelete?.title}"? It holds no blogs, so it will be archived and hidden from the panel.`}
        deleteModal={!!categoryToDelete}
        setDeleteModal={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        selectedRow={categoryToDelete}
        isLoading={deleting}
        handleDelete={async (row) => {
          if (!row) return;
          await onDelete?.(row);
          // Closed unconditionally: on failure the page has already toasted
          // the reason (blogs filed under it since the list was fetched).
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
