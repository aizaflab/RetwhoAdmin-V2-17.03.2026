"use client";

import { useState } from "react";
import { User } from "../_types/users.types";
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
import {
  Edit2,
  Trash2,
  MoreVertical,
  Eye,
  PowerOff,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { SearchIcon } from "@/components/icons/Icons";
import Image from "next/image";
import { Button } from "@/components/ui/button/Button";

import UserCreateDialog from "./UserCreateDialog";
import UserEditDialog from "./UserEditDialog";
import type { UserPayload } from "../_types/users.types";

interface UserListTableProps {
  users: User[];
  title: string;
  onCreate?: (payload: UserPayload) => void | Promise<void>;
  onUpdate?: (id: string, changes: Partial<User>) => void | Promise<void>;
}

export default function UserListTable({
  users,
  title,
  onCreate,
  onUpdate,
}: UserListTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const columns: Column<User>[] = [
    {
      id: "name",
      header: "User Details",
      cell: (value, user) => (
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0 overflow-hidden border border-primary/20">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
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
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                </SimpleTooltip>
              )}
            </div>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
              @{user.userName}
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
          <span className="text-[11px] text-foreground mt-0.5 font-medium tracking-wide">
            Phone: {user.phone}
          </span>
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Joined At",
      className: "hidden md:table-cell",
      cell: (value, user) => (
        <div className="flex flex-col">
          <span className="text-[13px] text-foreground font-medium">
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="text-[11px] text-muted-foreground/70 mt-0.5">
            {new Date(user.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, user) => (
        <span
          className={`inline-flex items-center text-[11px] font-medium px-3.5 h-6 rounded-full ${
            user.status === "active"
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50"
              : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50"
          }`}
        >
          {user.status === "active" ? "Active" : "Inactive"}
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
                setUserToEdit(user);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-150"
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
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-rose-400/50 hover:bg-rose-50 dark:hover:bg-rose-400/10 hover:text-rose-500 transition-all duration-150"
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
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-foreground text-[13px] rounded-md py-2 cursor-pointer"
              >
                View Profile
              </DropdownItem>
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
                }}
                className="text-blue-600 dark:text-blue-500 text-[13px] rounded-md py-2 cursor-pointer"
              >
                {user.isVerified ? "Revoke Verification" : "Verify User"}
              </DropdownItem>
              <DropdownItem
                icon={
                  user.status === "active" ? (
                    <PowerOff className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={`text-[13px] rounded-md py-2 cursor-pointer ${user.status === "active" ? "text-amber-600 dark:text-amber-500 focus:text-amber-600 dark:focus:text-amber-500" : "text-emerald-600 dark:text-emerald-500 focus:text-emerald-600 dark:focus:text-emerald-500"}`}
              >
                {user.status === "active" ? "Deactivate User" : "Activate User"}
              </DropdownItem>
              <div className="h-[1px] w-full bg-border my-1" />
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

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.userName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);

    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? u.status === "active"
          : u.status === "inactive";

    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <h3 className="sm:text-2xl text-xl font-medium">{title}</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-64">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>

          <div className="relative w-36">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-md bg-card">
                <SelectValue options={statusOptions} placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={statusOptions} />
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="h-10 shrink-0"
            startIcon={<Plus className="w-4 h-4" />}
          >
            Add User
          </Button>
        </div>
      </div>

      <Table<User>
        data={filtered}
        columns={columns}
        pagination={false}
        bordered
        emptyMessage="No users found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      {/* Create */}
      <UserCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />

      <DeleteModal
        title="Delete User?"
        text={`Are you sure you want to delete the user "${userToDelete?.name}" (@${userToDelete?.userName})? This action cannot be undone.`}
        deleteModal={!!userToDelete}
        setDeleteModal={(open) => {
          if (!open) setUserToDelete(null);
        }}
        selectedRow={userToDelete}
        handleDelete={(user) => {
          if (user) {
            // Delete logic here
            setUserToDelete(null);
          }
        }}
      />

      {/* Edit */}
      <UserEditDialog
        open={!!userToEdit}
        user={userToEdit}
        onClose={() => setUserToEdit(null)}
        onSubmit={onUpdate}
      />
    </div>
  );
}
