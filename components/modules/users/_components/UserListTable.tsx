"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Edit2,
  Trash2,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Store,
} from "lucide-react";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Input } from "@/components/ui/input/Input";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@/components/ui/dropdown/Dropdown";
import { SearchIcon } from "@/components/icons/Icons";

import {
  STATUS_FILTER_OPTIONS,
  VERIFIED_FILTER_OPTIONS,
  userStatusStyle,
} from "../_data/user-options";
import type { User, UserUpdatePayload } from "../_types/users.types";

interface UserListTableProps {
  users: User[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filters / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  verifiedFilter: string;
  onVerifiedFilterChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onEdit?: (user: User) => void;
  /** Verification and status flips reuse the same PATCH the edit dialog does. */
  onQuickUpdate?: (user: User, changes: UserUpdatePayload) => Promise<void>;
  onDelete?: (user: User) => Promise<void> | void;
  deleting?: boolean;
}

const ACTION_BUTTON =
  "cursor-pointer center size-8 rounded-lg border border-border bg-card text-muted-foreground transition-all duration-150";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export default function UserListTable({
  users,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  verifiedFilter,
  onVerifiedFilterChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onEdit,
  onQuickUpdate,
  onDelete,
  deleting,
}: UserListTableProps) {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const columns: Column<User>[] = [
    {
      id: "name",
      header: "User Details",
      cell: (value, user) => (
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0 overflow-hidden border border-primary/20">
            {user.profileImage?.url ? (
              <Image
                src={user.profileImage.url}
                alt={user.name}
                width={100}
                height={100}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-primary font-medium text-sm">
                {user.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground line-clamp-1">
                {user.name}
              </p>
              {user.isVerified && (
                <SimpleTooltip content="Verified User" position="top">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                </SimpleTooltip>
              )}
            </div>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
              {user.userName ? `@${user.userName}` : "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Contact Info",
      cell: (value, user) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground line-clamp-1">
            {user.email}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 font-medium tracking-wide">
            {user.phoneNumber || "No phone"}
          </span>
        </div>
      ),
    },
    {
      id: "shopCount",
      header: "Shops",
      className: "text-center",
      cell: (value, user) => {
        const count = user.shopCount ?? 0;
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              count > 0 ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Store className="size-3.5" />
            {count}
          </span>
        );
      },
    },
    {
      id: "createdAt",
      header: "Joined At",
      className: "hidden md:table-cell",
      cell: (value, user) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, user) => (
        <span
          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${userStatusStyle(
            user.status,
          )}`}
        >
          {user.status ?? "unknown"}
        </span>
      ),
    },
    {
      id: "actions" as keyof User,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, user) => (
        <div className="flex items-center justify-end gap-1.5 relative">
          <SimpleTooltip content="Edit Details" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(user);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) =>
              setOpenDropdownId(isOpen ? user._id : null)
            }
          >
            <SimpleTooltip
              content="More Options"
              position="top"
              disabled={openDropdownId === user._id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className={`${ACTION_BUTTON} hover:border-destructive/50 hover:text-destructive`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu
              align="end"
              className="min-w-45 p-1.5 font-medium shadow-md border rounded-xl"
            >
              <DropdownItem
                icon={
                  user.isVerified ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  void onQuickUpdate?.(user, { isVerified: !user.isVerified });
                }}
                className="text-primary text-[13px] rounded-md py-2 cursor-pointer"
              >
                {user.isVerified ? "Revoke Verification" : "Verify User"}
              </DropdownItem>
              <div className="h-px w-full bg-border my-1" />
              <DropdownItem
                icon={<Trash2 className="size-4" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setUserToDelete(user);
                }}
                className="text-[13px] rounded-md py-2 cursor-pointer"
              >
                Delete User
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
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="text-xl font-medium text-foreground">Available Users</h3>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {/* Search — matches name, username, email and phone server-side. */}
          <div className="relative flex-1 sm:w-60">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search users..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card border-border"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {/* Verification filter */}
            <div className="relative w-32">
              <Select
                value={verifiedFilter}
                onValueChange={onVerifiedFilterChange}
              >
                <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                  <SelectValue
                    options={VERIFIED_FILTER_OPTIONS}
                    placeholder="All Users"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={VERIFIED_FILTER_OPTIONS} />
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="relative w-32">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                  <SelectValue
                    options={STATUS_FILTER_OPTIONS}
                    placeholder="All Status"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={STATUS_FILTER_OPTIONS} />
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<User>
        data={users}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        totalData={total}
        bordered
        emptyMessage="No users found"
        headerColor="bg-muted/60"
        tableClassName="min-w-full"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete User?"
        text={`Are you sure you want to delete "${userToDelete?.name}"? You cannot undo this action.`}
        deleteModal={!!userToDelete}
        setDeleteModal={(open) => {
          if (!open) setUserToDelete(null);
        }}
        selectedRow={userToDelete}
        isLoading={deleting}
        handleDelete={async (user) => {
          if (!user) return;
          await onDelete?.(user);
          // Closed unconditionally: on failure the page has already toasted the
          // reason (the user still owns shops), and leaving the modal open
          // would only invite the same rejected click again.
          setUserToDelete(null);
        }}
      />
    </div>
  );
}
