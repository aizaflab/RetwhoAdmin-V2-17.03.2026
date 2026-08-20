"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import {
  Trash2,
  Eye,
  Image as ImageIcon,
  Archive,
  Globe,
  FileEdit,
} from "lucide-react";
import { SearchIcon, EditIcon, MoreIcon } from "@/components/icons/Icons";

import BlogPostViewDrawer from "./BlogPostViewDrawer";
import {
  POST_STATUS_FILTER_OPTIONS,
  blogStatusStyle,
} from "../_data/blog-options";
import type { BlogPost, BlogStatus } from "../_types/blog.types";

interface BlogPostListTableProps {
  posts: BlogPost[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filters / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  /** Assignable categories from `GET /blogs/categories/options`. */
  categoryOptions: { label: string; value: string }[];
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onUpdateStatus?: (post: BlogPost, status: BlogStatus) => Promise<void> | void;
  onDelete?: (post: BlogPost) => Promise<void> | void;
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

export default function BlogPostListTable({
  posts,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onUpdateStatus,
  onDelete,
  deleting,
}: BlogPostListTableProps) {
  const router = useRouter();

  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const categoryFilterOptions = [
    { value: "all", label: "All Categories" },
    ...categoryOptions.map((c) => ({ value: c.value, label: c.label })),
  ];

  const columns: Column<BlogPost>[] = [
    {
      id: "title",
      header: "Blog Details",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
            {row.image?.url ? (
              <Image
                src={row.image.url}
                alt={row.image.alt || row.title}
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
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {row.category?.title || "Uncategorised"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                /{row.slug}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "viewCount",
      header: "Views",
      className: "text-center hidden sm:table-cell",
      cell: (value, row) => (
        <span className="text-sm font-semibold text-foreground">
          {(row.viewCount ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "publishedAt",
      header: "Published On",
      className: "text-left hidden md:table-cell",
      cell: (value, row) => (
        <span className="text-sm text-muted-foreground">
          {/* Drafts have never been published, so they show the dash rather
              than misrepresenting their creation date as a publish date. */}
          {formatDate(row.publishedAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, row) => (
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${blogStatusStyle(
            row.status,
          )}`}
        >
          {/* Posts seeded before the schema default have no status; the model
              would have written `draft`, so that is what the badge shows. */}
          {row.status ?? "draft"}
        </span>
      ),
    },
    {
      id: "actions" as keyof BlogPost,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, row) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/blog/post/edit/${row._id}`);
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

            <DropdownMenu align="right" className="min-w-37.5 p-1 font-medium">
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingPost(row);
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
                      Publish to Site
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
                  setPostToDelete(row);
                }}
                className="text-xs rounded-sm py-2 cursor-pointer"
              >
                Delete Post
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
        <h3 className="text-xl font-medium text-foreground">All Posts</h3>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Search — matches title, slug, meta and tags server-side. */}
          <div className="relative flex-1 md:w-56 min-w-50">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search posts..."
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
              options={POST_STATUS_FILTER_OPTIONS.map((o) => ({
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
      <Table<BlogPost>
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
        emptyMessage="No posts found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
      />

      {/* View Drawer */}
      {viewingPost && (
        <BlogPostViewDrawer
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onEdit={() => router.push(`/blog/post/edit/${viewingPost._id}`)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Post"
        text={`Delete "${postToDelete?.title}"? The post will be archived and hidden from the panel.`}
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
