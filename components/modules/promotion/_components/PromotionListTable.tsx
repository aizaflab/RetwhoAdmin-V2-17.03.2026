"use client";

import { useState } from "react";
import {
  Promotion,
  Wholesaler,
  PromotionStatus,
} from "../_types/promotion.types";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Input } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown/Dropdown";

import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  MoreIcon,
  EyeIcon,
  LinkIcon,
  DeleteIcon,
  ImageIcon,
} from "@/components/icons/Icons";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import PromotionViewDrawer from "./PromotionViewDrawer";
import { Select } from "@/components/ui/select/Select";

interface PromotionListTableProps {
  promotions: Promotion[];
  wholesalers: Wholesaler[];
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: PromotionStatus) => void;
}

const STATUS_STYLES: Record<PromotionStatus, string> = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
  inactive:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400 border-slate-100 dark:border-slate-700/50",
  scheduled:
    "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
  expired:
    "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
};

function PromotionListTable({ promotions, onDelete }: PromotionListTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(
    null,
  );
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(
    null,
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "scheduled", label: "Scheduled" },
    { value: "expired", label: "Expired" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "pdf", label: "PDF" },
  ];

  const columns: Column<Promotion>[] = [
    {
      id: "title",
      header: "Promotion & Wholesaler",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative size-11 rounded-lg bg-gray-100 dark:bg-darkBorder overflow-hidden shrink-0">
            {row.bannerImage ? (
              <Image
                src={row.bannerImage}
                alt={row.title}
                className="w-full h-full object-cover"
                fill
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="max-w-50 sm:max-w-xs">
            <p className="text-sm font-semibold text-black dark:text-white truncate">
              {row.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-2">
                <span className="text-[11px] opacity-50">
                  {row.wholesalerName}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium  text-primary dark:text-darkLight ">
                  <div className="size-1 rounded-full bg-primary dark:bg-darkLight"></div>
                  <span className="ml-0.5">{row.adType}</span>
                </span>
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "targetAudience",
      header: "Target",
      className: "hidden lg:table-cell",
      cell: (value, row) => (
        <span className="inline-flex items-center  justify-center text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-darkBorder/30 dark:text-indigo-300 border border-indigo-100 dark:border-darkBorder capitalize ">
          {row.targetAudience}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      className: "text-center hidden sm:table-cell",
      cell: (value, row) => (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-xs font-semibold text-yellow-600 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-800/50 ">
          {row.priority}
        </div>
      ),
    },
    {
      id: "startDate" as keyof Promotion,
      header: "Validity",
      className: "hidden xl:table-cell",
      cell: (value, row) => (
        <div className="flex flex-col text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-emerald-500 font-medium w-6">S:</span>
            <span>
              {row.startDate
                ? format(new Date(row.startDate), "dd MMM yyyy")
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-rose-500 font-medium w-6">E:</span>
            <span>
              {row.endDate
                ? format(new Date(row.endDate), "dd MMM yyyy")
                : "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, row) => (
        <span
          className={`inline-flex items-center justify-center w-20 text-[10px] font-semibold px-2 py-1 rounded-full capitalize border ${STATUS_STYLES[row.status]}`}
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
        <div className="flex items-center justify-end gap-2">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={() => router.push(`/promotion/edit/${row.id}`)}
              className="center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-[#0284c7] hover:text-[#0284c7] transition-all cursor-pointer"
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
                <button className="center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                  <MoreIcon className="w-4 h-4" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu className="min-w-40 p-1 " align="right">
              <DropdownItem
                icon={<EyeIcon className="w-4 h-4" />}
                onClick={() => setViewingPromotion(row)}
                className="text-xs py-2.5 rounded-md cursor-pointer transition-colors font-medium"
              >
                View Details
              </DropdownItem>

              <DropdownItem
                icon={<LinkIcon className="w-4 h-4" />}
                onClick={() => window.open(row.mediaUrl, "_blank")}
                className="text-xs py-2.5 rounded-md cursor-pointer transition-colors font-medium"
              >
                Open Media Link
              </DropdownItem>

              <DropdownSeparator className="my-1.5" />
              <DropdownItem
                icon={<DeleteIcon className="size-3.5" />}
                destructive
                onClick={() => setPromotionToDelete(row)}
                className="text-xs py-2.5 rounded-md cursor-pointer"
              >
                Delete Promotion
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  const filtered = promotions.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.wholesalerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || r.adType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-5">
      {/* Header & Toolbar */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
          Manage Promotion
        </h1>

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, wholesaler..."
              startIcon={<SearchIcon className="w-4 h-4 text-gray-400" />}
              className="h-10 dark:border-darkBorder dark:focus:border-primary"
            />
          </div>

          <div className="w-32">
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className=" dark:border-darkBorder dark:focus:border-primary"
              fieldClass="h-10!"
            />
          </div>

          <div className="w-32">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className=" w-full"
              fieldClass="h-10!"
            />
          </div>

          <Button
            onClick={() => router.push("/promotion/add")}
            className="h-10"
          >
            <PlusIcon className="size-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div>
        <Table<Promotion>
          data={filtered}
          columns={columns}
          pagination={true}
          totalData={filtered.length}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          emptyMessage="No promotions found matching your criteria"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Promotion"
        text={`Are you sure you want to delete "${promotionToDelete?.title}"? This will remove it from all displays.`}
        deleteModal={!!promotionToDelete}
        setDeleteModal={(open) => {
          if (!open) setPromotionToDelete(null);
        }}
        selectedRow={promotionToDelete}
        handleDelete={(row) => {
          if (row) {
            onDelete?.(row.id);
            setPromotionToDelete(null);
          }
        }}
      />

      {/* View Drawer */}
      {viewingPromotion && (
        <PromotionViewDrawer
          promotion={viewingPromotion}
          onClose={() => setViewingPromotion(null)}
          onEdit={() => router.push(`/promotion/edit/${viewingPromotion.id}`)}
        />
      )}
    </div>
  );
}

export default PromotionListTable;
