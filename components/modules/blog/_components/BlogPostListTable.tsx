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
  Trash2,
  Eye,
  Image as ImageIcon,
  Archive,
  Globe,
  FileEdit,
} from "lucide-react";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  MoreIcon,
} from "@/components/icons/Icons";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import BlogPostViewDrawer from "./BlogPostViewDrawer";
import Image from "next/image";

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
    "bg-muted/50 text-muted-foreground dark:bg-muted dark:text-muted-foreground",
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
            <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
              {row.image ? (
                <Image
                  src={row.image}
                  alt={row.altText}
                  className="w-full h-full object-cover"
                  width={1000}
                  height={1000}
                  priority
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
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400">
                  {category?.name || "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  /{row.slug}
                </span>
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
        <span className="text-sm font-semibold text-foreground">
          {row.views.toLocaleString()}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Published On",
      className: "text-left hidden md:table-cell",
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
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <EditIcon className="w-3.5 h-3.5" />
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
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-rose-400/50 hover:text-rose-500 transition-all duration-150"
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
                        onUpdateStatus(row.id, "published");
                      }}
                      className="text-emerald-600 dark:text-emerald-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    >
                      Publish to Site
                    </DropdownItem>
                  )}
                  {row.status !== "draft" && (
                    <DropdownItem
                      icon={<FileEdit className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "draft");
                      }}
                      className="text-amber-600 dark:text-amber-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20"
                    >
                      Revert to Draft
                    </DropdownItem>
                  )}
                  {row.status !== "archived" && (
                    <DropdownItem
                      icon={<Archive className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "archived");
                      }}
                      className="text-muted-foreground text-xs rounded-sm py-2 cursor-pointer hover:bg-muted/50 dark:hover:bg-muted"
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
        <h1 className="sm:text-2xl text-xl font-medium text-foreground">
          All Posts
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-50">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>

          <div className="relative w-36">
            <SimpleSelect
              options={categoryOptions}
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              className="h-10 rounded-md bg-card"
            />
          </div>

          <div className="relative w-28">
            <SimpleSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="h-10 rounded-md bg-card"
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
          headerColor="bg-muted/50"
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
