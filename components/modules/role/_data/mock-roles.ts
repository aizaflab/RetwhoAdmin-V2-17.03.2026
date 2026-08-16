import { ROLE_PAGES } from "./role-pages";
import type { Role } from "../_types/role.types";

/** Every page fully granted — matches the seeded Super Admin role. */
const FULL_ACCESS = ROLE_PAGES.map(({ page }) => ({
  page,
  add: true,
  edit: true,
  view: true,
  delete: true,
}));

/** Read-only across the listed pages. */
const viewOnly = (pages: string[]) =>
  pages.map((page) => ({
    page,
    add: false,
    edit: false,
    view: true,
    delete: false,
  }));

/** Sample rows shaped exactly like the `GET /admin-role` response data. */
export const MOCK_ROLES: Role[] = [
  {
    _id: "69e799ba5cbbabd4e44a727f",
    name: "Super Admin",
    description: "Full access to all admin panel features.",
    permissions: FULL_ACCESS,
    status: "active",
    isSystem: true,
    createdBy: null,
    updatedBy: null,
    createdAt: "2026-04-21T15:37:30.549Z",
    updatedAt: "2026-04-21T15:37:30.549Z",
  },
  {
    _id: "69e79e480a64033867cfdcf4",
    name: "Manager",
    description: "Manages shop operations and staff",
    permissions: [
      { page: "dashboard", add: false, edit: false, view: true, delete: false },
      {
        page: "admin-employee",
        add: true,
        edit: true,
        view: true,
        delete: false,
      },
      { page: "user", add: false, edit: true, view: true, delete: false },
      { page: "shop", add: true, edit: true, view: true, delete: true },
    ],
    status: "active",
    isSystem: false,
    createdBy: "69e799bb5cbbabd4e44a7280",
    updatedBy: null,
    createdAt: "2026-04-21T15:56:56.723Z",
    updatedAt: "2026-04-21T15:56:56.723Z",
  },
  {
    _id: "69e79ec50a64033867cfdcf5",
    name: "Sales Executive",
    description: "Handles customer sales and product selling",
    permissions: [],
    status: "active",
    isSystem: false,
    createdBy: "69e799bb5cbbabd4e44a7280",
    updatedBy: null,
    createdAt: "2026-04-21T15:59:01.943Z",
    updatedAt: "2026-04-21T15:59:01.943Z",
  },
  {
    _id: "69e79ec50a64033867cfdcf6",
    name: "Content Editor",
    description: "Writes and publishes blog posts and marketing content",
    permissions: [
      { page: "dashboard", add: false, edit: false, view: true, delete: false },
      { page: "blog", add: true, edit: true, view: true, delete: true },
    ],
    status: "active",
    isSystem: false,
    createdBy: "69e799bb5cbbabd4e44a7280",
    updatedBy: "69e799bb5cbbabd4e44a7280",
    createdAt: "2026-03-02T10:14:22.000Z",
    updatedAt: "2026-04-18T08:41:07.000Z",
  },
  {
    _id: "69e79ec50a64033867cfdcf7",
    name: "Support Agent",
    description: "Responds to customer queries and reviews user accounts",
    permissions: viewOnly(["dashboard", "user", "shop"]),
    status: "active",
    isSystem: false,
    createdBy: "69e799bb5cbbabd4e44a7280",
    updatedBy: null,
    createdAt: "2026-02-11T13:05:44.000Z",
    updatedAt: "2026-02-11T13:05:44.000Z",
  },
  {
    _id: "69e79ec50a64033867cfdcf8",
    name: "Auditor",
    description: "Read-only access to logs and settings for compliance checks",
    permissions: viewOnly(["dashboard", "logs", "settings"]),
    status: "inactive",
    isSystem: false,
    createdBy: null,
    updatedBy: "69e799bb5cbbabd4e44a7280",
    createdAt: "2025-12-19T09:30:00.000Z",
    updatedAt: "2026-01-27T16:12:33.000Z",
  },
  {
    _id: "69e79ec50a64033867cfdcf9",
    name: "Operations Supervisor",
    description: "Oversees daily operations and coordinates team activities",
    permissions: [
      { page: "dashboard", add: false, edit: false, view: true, delete: false },
      {
        page: "admin-employee",
        add: false,
        edit: true,
        view: true,
        delete: false,
      },
      { page: "logs", add: false, edit: false, view: true, delete: false },
    ],
    status: "inactive",
    isSystem: false,
    createdBy: "69e799bb5cbbabd4e44a7280",
    updatedBy: null,
    createdAt: "2026-05-04T07:48:19.000Z",
    updatedAt: "2026-05-09T11:26:50.000Z",
  },
];
