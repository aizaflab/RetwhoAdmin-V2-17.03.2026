"use client";

import { useState } from "react";
import { BlogPost, BlogCategory } from "../_types/blog.types";
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
  Edit2,
  Trash2,
  MoreVertical,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { SearchIcon, PlusIcon } from "@/components/icons/Icons";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import BlogPostViewDrawer from "./BlogPostViewDrawer";

interface BlogPostListTableProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  onDelete?: (id: string) => void;
  onUpdateStatus?: (
    id: string,
    status: "published" | "draft" | "archived",
  ) => void;
}

const STATUS_STYLES = {
  published:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  archived:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
};

function BlogPostListTable({
  posts,
  categories,
  onDelete,
  onUpdateStatus,
}: BlogPostListTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const columns: Column<BlogPost>[] = [
    {
      id: "title",
      header: "Blog Details",
      cell: (value, row) => {
        const category = categories.find((c) => c.id === row.categoryId);
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg bg-gray-100 dark:bg-darkBorder overflow-hidden shrink-0">
              {row.bannerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.bannerImage}
                  alt={row.altText}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text5">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="max-w-50 sm:max-w-xs">
              <p className="text-sm font-semibold text-black dark:text-white truncate">
                {row.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400">
                  {category?.name || "Unknown"}
                </span>
                <span className="text-xs text-text5 truncate">/{row.slug}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "views",
      header: "Views",
      className: "text-center hidden sm:table-cell",
      cell: (value, row) => (
        <span className="text-sm font-semibold text-text6 dark:text-text5">
          {row.views.toLocaleString()}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Published On",
      className: "text-left hidden md:table-cell",
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
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize border border-transparent ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
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
                router.push(`/blog/post/edit/${row.id}`);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? row.id : null)}
          >
            <SimpleTooltip
              content="More"
              position="top"
              disabled={openDropdownId === row.id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:text-rose-500 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="end" className="min-w-37.5 p-1 font-medium">
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingPost(row);
                }}
                className="text-text6 dark:text-text5 text-xs rounded-sm py-2 cursor-pointer"
              >
                View Details
              </DropdownItem>

              {onUpdateStatus && (
                <>
                  <DropdownSeparator />
                  <DropdownLabel>Update Status</DropdownLabel>
                  {row.status !== "published" && (
                    <DropdownItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "published");
                      }}
                      className="text-emerald-600 dark:text-emerald-400 text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Mark as Published
                    </DropdownItem>
                  )}
                  {row.status !== "draft" && (
                    <DropdownItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "draft");
                      }}
                      className="text-amber-600 dark:text-amber-400 text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Mark as Draft
                    </DropdownItem>
                  )}
                  {row.status !== "archived" && (
                    <DropdownItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "archived");
                      }}
                      className="text-slate-600 dark:text-slate-400 text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Mark as Archived
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

  const filtered = posts.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchCategory =
      categoryFilter === "all" || r.categoryId === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
        <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
          All Posts
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-50">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80 dark:focus:border-darkBorder"
            />
          </div>

          <div className="relative w-36">
            <SimpleSelect
              options={categoryOptions}
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>

          <div className="relative w-28">
            <SimpleSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>

          <Button
            onClick={() => router.push("/blog/post/add")}
            className="px-3.5 h-10 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add Post
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="">
        <Table<BlogPost>
          data={filtered}
          columns={columns}
          pagination={false}
          bordered
          emptyMessage="No posts found"
          headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
          tableClassName="min-w-full"
        />
      </div>

      {/* View Drawer */}
      {viewingPost && (
        <BlogPostViewDrawer
          post={viewingPost}
          category={categories.find((c) => c.id === viewingPost.categoryId)}
          onClose={() => setViewingPost(null)}
          onEdit={() => router.push(`/blog/post/edit/${viewingPost.id}`)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Post"
        text={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
        deleteModal={!!postToDelete}
        setDeleteModal={(open) => {
          if (!open) setPostToDelete(null);
        }}
        selectedRow={postToDelete}
        handleDelete={(row) => {
          if (row) {
            onDelete?.(row.id);
            setPostToDelete(null);
          }
        }}
      />
    </div>
  );
}

export default BlogPostListTable;
