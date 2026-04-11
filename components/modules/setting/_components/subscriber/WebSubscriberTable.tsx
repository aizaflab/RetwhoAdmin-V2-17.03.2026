"use client";

import { useState } from "react";
import { format } from "date-fns";
import { WebSubscriber } from "../../_types/setting.types";
import { Input, SimpleSelect } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown/Dropdown";
import { SearchIcon, MoreIcon } from "@/components/icons/Icons";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Trash2,
  BadgeCheck,
  Ban,
  Globe,
  Monitor,
  Share2,
  FileText,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  unsubscribed:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
  bounced: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
};

const SOURCE_CONFIG: Record<
  WebSubscriber["source"],
  { label: string; icon: React.ReactNode; color: string }
> = {
  website: {
    label: "Website",
    icon: <Globe className="w-3 h-3" />,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
  blog: {
    label: "Blog",
    icon: <FileText className="w-3 h-3" />,
    color:
      "bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  },
  popup: {
    label: "Popup",
    icon: <Monitor className="w-3 h-3" />,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  },
  footer: {
    label: "Footer",
    icon: <Globe className="w-3 h-3" />,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400",
  },
  social: {
    label: "Social",
    icon: <Share2 className="w-3 h-3" />,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400",
  },
};

interface WebSubscriberTableProps {
  subscribers: WebSubscriber[];
}

export default function WebSubscriberTable({
  subscribers: initialSubscribers,
}: WebSubscriberTableProps) {
  const [subscribers, setSubscribers] =
    useState<WebSubscriber[]>(initialSubscribers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [deleting, setDeleting] = useState<WebSubscriber | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = subscribers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.email.toLowerCase().includes(q) ||
      (s.name?.toLowerCase().includes(q) ?? false);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchSource = sourceFilter === "all" || s.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const handleUpdateStatus = (id: string, status: WebSubscriber["status"]) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  };

  const handleDelete = (row: WebSubscriber | null) => {
    if (!row) return;
    setSubscribers((prev) => prev.filter((s) => s.id !== row.id));
    setDeleting(null);
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "unsubscribed", label: "Unsubscribed" },
    { value: "bounced", label: "Bounced" },
  ];

  const sourceOptions = [
    { value: "all", label: "All Sources" },
    { value: "website", label: "Website" },
    { value: "blog", label: "Blog" },
    { value: "popup", label: "Popup" },
    { value: "footer", label: "Footer" },
    { value: "social", label: "Social" },
  ];

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.status === "active").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    bounced: subscribers.filter((s) => s.status === "bounced").length,
  };

  // Growth rate (mock)
  const growthRate = ((stats.active / Math.max(stats.total, 1)) * 100).toFixed(
    0,
  );

  const columns: Column<WebSubscriber>[] = [
    {
      id: "email",
      header: "Subscriber",
      cell: (_v, row) => (
        <div className="max-w-52">
          <p className="text-sm font-semibold text-black dark:text-white truncate">
            {row.name ?? row.email}
          </p>
          {row.name && (
            <p className="text-xs text-text5 truncate">{row.email}</p>
          )}
        </div>
      ),
    },
    {
      id: "source",
      header: "Source",
      className: "hidden sm:table-cell",
      cell: (_v, row) => {
        const src = SOURCE_CONFIG[row.source];
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${src.color}`}
          >
            {src.icon}
            {src.label}
          </span>
        );
      },
    },
    {
      id: "tags",
      header: "Tags",
      className: "hidden lg:table-cell",
      cell: (_v, row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.length > 0 ? (
            row.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-blue-400 capitalize"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-text5">—</span>
          )}
        </div>
      ),
    },
    {
      id: "subscribedAt",
      header: "Subscribed",
      className: "hidden md:table-cell",
      cell: (_v, row) => (
        <span className="text-sm text-text6 dark:text-text5">
          {format(new Date(row.subscribedAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (_v, row) => (
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "id" as keyof WebSubscriber,
      header: "Actions",
      className: "justify-end text-right",
      cell: (_v, row) => (
        <div className="flex items-center justify-end gap-1 relative">
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
                  <MoreIcon className="w-4 h-4" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="right" className="min-w-44 p-1 font-medium">
              {row.status !== "active" && (
                <DropdownItem
                  icon={<BadgeCheck className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(row.id, "active");
                  }}
                  className="text-emerald-600 dark:text-emerald-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                >
                  Mark as Active
                </DropdownItem>
              )}
              {row.status !== "unsubscribed" && (
                <DropdownItem
                  icon={<Ban className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(row.id, "unsubscribed");
                  }}
                  className="text-slate-600 dark:text-slate-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20"
                >
                  Unsubscribe
                </DropdownItem>
              )}
              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 className="size-3.5" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleting(row);
                }}
                className="text-xs rounded-sm py-2 cursor-pointer"
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-primary dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-black dark:text-white leading-none">
              {stats.total}
            </p>
            <p className="text-xs text-text5 mt-0.5">Total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-black dark:text-white leading-none">
              {stats.active}
            </p>
            <p className="text-xs text-text5 mt-0.5">Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800/30 flex items-center justify-center shrink-0">
            <UserX className="w-4.5 h-4.5 text-slate-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-black dark:text-white leading-none">
              {stats.unsubscribed}
            </p>
            <p className="text-xs text-text5 mt-0.5">Unsubs.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-black dark:text-white leading-none">
              {stats.bounced}
            </p>
            <p className="text-xs text-text5 mt-0.5">Bounced</p>
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="mb-5 p-4 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-black dark:text-white">
            List Health Score
          </span>
          <span className="text-sm font-bold text-emerald-500">
            {growthRate}% Active
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-darkBorder rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${growthRate}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-text5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            {stats.active} Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            {stats.unsubscribed} Unsubscribed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            {stats.bounced} Bounced
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
        <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
          Web Subscribers
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-48">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80"
            />
          </div>
          <div className="relative w-32">
            <SimpleSelect
              options={sourceOptions}
              value={sourceFilter}
              onChange={(val) => setSourceFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>
          <div className="relative w-32">
            <SimpleSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<WebSubscriber>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        bordered
        emptyMessage="No subscribers found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
      />

      {/* Delete Modal */}
      <DeleteModal
        title="Remove Subscriber"
        text={`Are you sure you want to remove "${deleting?.email}" from the subscriber list? This action cannot be undone.`}
        deleteModal={!!deleting}
        setDeleteModal={(open) => {
          if (!open) setDeleting(null);
        }}
        selectedRow={deleting}
        handleDelete={handleDelete}
      />
    </div>
  );
}
