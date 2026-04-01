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
import { BlogCategory } from "../_types/blog.types";
import BlogCategoryModal from "./BlogCategoryModal";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";

const STATUS_STYLES = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
};

export default function BlogCategoryListTable({
  categories,
}: {
  categories: BlogCategory[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [categoryToDelete, setCategoryToDelete] = useState<BlogCategory | null>(
    null,
  );
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const columns: Column<BlogCategory>[] = [
    {
      id: "name",
      header: "Category",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/20 shrink-0">
            <FlexTextIcon className="w-4 h-4 text-primary dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">
              {row.name}
            </p>
            <p className="text-[10px] text-text5">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "postCount",
      header: "Posts",
      className: "text-center",
      cell: (value, row) => (
        <span className="text-sm font-semibold text-text6 dark:text-text5">
          {row.postCount}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created Date",
      className: "text-left hidden sm:table-cell",
      cell: (value, row) => (
        <span className="text-sm text-text6 dark:text-text5">
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
          className={` text-xs font-semibold px-2.5 w-18 center  py-1 rounded-full capitalize ${STATUS_STYLES[row.status]}`}
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
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Delete" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCategoryToDelete(row);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
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
        <h1 className="sm:text-2xl text-xl font-medium ">Categories</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-auto min-w-[200px] flex-1">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80 dark:focus:border-darkBorder"
            />
          </div>

          <div className="relative w-32">
            <Select
              options={statusOptions}
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
              className="rounded-md bg-white dark:bg-darkBg"
              fieldClass="h-10!"
            />
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
          pagination={true}
          totalData={categories.length}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          bordered
          emptyMessage="No categories found"
          headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
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
          onSave={() => {
            setIsAddModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Category"
        text={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
        deleteModal={!!categoryToDelete}
        setDeleteModal={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        selectedRow={categoryToDelete}
        handleDelete={(row) => {
          if (row) {
            setCategoryToDelete(null);
          }
        }}
      />
    </div>
  );
}
