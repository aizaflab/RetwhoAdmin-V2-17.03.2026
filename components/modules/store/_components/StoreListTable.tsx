"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shop } from "../_types/store.types";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Input, SimpleSelect } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@/components/ui/dropdown/Dropdown";
import {
  Store,
  Edit2,
  Trash2,
  MoreVertical,
  Eye,
  LogIn,
  PowerOff,
  CheckCircle2,
} from "lucide-react";
import { SearchIcon } from "@/components/icons/Icons";
import { Select } from "@/components/ui/select/Select";

interface StoreListTableProps {
  stores: Shop[];
  title: string;
}

export default function StoreListTable({ stores, title }: StoreListTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [storeToDelete, setStoreToDelete] = useState<Shop | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Deep thinking features - handling SSO Login precisely for security
  const handleSSOLogin = (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation();
    // Concept: Initiate secure login-as action logic via API
    console.log(`Initiating SSO Login for account: ${shop.accountId}`);
    alert(
      `SSO Authenticated. Logging in as ${shop.companyName} (${shop.accountId}). Redirecting to user domain...`,
    );
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const columns: Column<Shop>[] = [
    {
      id: "companyName",
      header: "Company & DBA",
      cell: (value, shop) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/20 shrink-0">
            <Store className="w-4 h-4 text-primary dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black dark:text-white line-clamp-1">
              {shop.companyName}
            </p>
            <p className="text-[11px] font-medium text-text5 mt-0.5">
              DBA: {shop.dbaName || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Contact Info",
      cell: (value, shop) => (
        <div className="flex flex-col">
          <span className="text-sm text-black dark:text-white line-clamp-1">
            {shop.email}
          </span>
          <span className="text-[11px] text-text6 dark:text-text5 mt-0.5 font-medium tracking-wide">
            Phone:-{shop.phone}
          </span>
        </div>
      ),
    },
    {
      id: "fein",
      header: "Identifications",
      cell: (value, shop) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-text6 dark:text-text5">
            <span className="text-text5 mr-1">ACC:</span>
            {shop.accountId}
          </span>
          <span className="text-[11px] font-medium text-text6 dark:text-text5">
            <span className="text-text5 mr-1">FEIN:</span>
            {shop.fein || "—"}
          </span>
        </div>
      ),
    },
    {
      id: "address",
      header: "Location",
      className: "hidden md:table-cell",
      cell: (value, shop) => (
        <span className="text-[13px] text-text6 dark:text-text5">
          {shop.address.city}, {shop.address.state}
        </span>
      ),
    },
    {
      id: "isActive",
      header: "Status",
      className: "text-center",
      cell: (value, shop) => (
        <span
          className={`inline-flex items-center text-[11px] font-medium px-3.5 h-6 rounded-full ${
            shop.isActive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
          }`}
        >
          {shop.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions" as keyof Shop,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, shop) => (
        <div className="flex items-center justify-end gap-1.5 relative">
          <SimpleTooltip content="Login as Shop (SSO)" position="top">
            <button
              onClick={(e) => handleSSOLogin(e, shop)}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-emerald-400/50 hover:bg-emerald-50 dark:hover:bg-emerald-400/10 hover:text-emerald-500 transition-all duration-150 "
            >
              <LogIn className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Edit Details" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-150 "
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) =>
              setOpenDropdownId(isOpen ? shop.id : null)
            }
          >
            <SimpleTooltip
              content="More Options"
              position="top"
              disabled={openDropdownId === shop.id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:bg-rose-50 dark:hover:bg-rose-400/10 hover:text-rose-500 transition-all duration-150 "
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu
              align="end"
              className="min-w-[170px] p-1.5 font-medium shadow-md border dark:border-darkBorder rounded-xl"
            >
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-text6 dark:text-text5 text-[13px] rounded-md py-2 cursor-pointer"
              >
                View Full Details
              </DropdownItem>
              <DropdownItem
                icon={
                  shop.isActive ? (
                    <PowerOff className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={`text-[13px] rounded-md py-2 cursor-pointer ${shop.isActive ? "text-amber-600 dark:text-amber-500 focus:text-amber-600 dark:focus:text-amber-500" : "text-emerald-600 dark:text-emerald-500 focus:text-emerald-600 dark:focus:text-emerald-500"}`}
              >
                {shop.isActive ? "Deactivate Store" : "Activate Store"}
              </DropdownItem>
              <DropdownItem
                icon={<Trash2 className="size-4" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setStoreToDelete(shop);
                }}
                className="text-[13px] rounded-md py-2 cursor-pointer"
              >
                Delete Store
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  const filtered = stores.filter((s) => {
    const matchSearch =
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.dbaName.toLowerCase().includes(search.toLowerCase()) ||
      s.accountId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? s.isActive
          : !s.isActive;

    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <h3 className="sm:text-2xl text-xl font-medium">{title}</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-64">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80 dark:focus:border-darkLight/50"
            />
          </div>

          <div className="relative w-36">
            <Select
              options={statusOptions}
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
              className="rounded-md bg-white dark:bg-darkBg"
              fieldClass="h-10!"
            />
          </div>
        </div>
      </div>

      <Table<Shop>
        data={filtered}
        columns={columns}
        pagination={false}
        bordered
        emptyMessage="No stores found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      <DeleteModal
        title="Delete Store?"
        text={`Are you sure you want to delete the store "${storeToDelete?.companyName}"? This action cannot be undone.`}
        deleteModal={!!storeToDelete}
        setDeleteModal={(open) => {
          if (!open) setStoreToDelete(null);
        }}
        selectedRow={storeToDelete}
        handleDelete={(shop) => {
          if (shop) {
            // Delete logic here
            setStoreToDelete(null);
          }
        }}
      />
    </div>
  );
}
