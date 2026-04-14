// src/config-menu.ts

import { AdminMenuItem } from "../../access-control/_types/access.types";
import { PERMISSIONS } from "../../access-control/_config/permission";

import {
  Package,
  Link2,
  ShoppingCart,
  FileText,
  Settings,
  Megaphone,
  ShieldCheck,
  Headphones,
  NotebookPen,
  BriefcaseBusiness,
} from "lucide-react";
import { ChartBarIcon, UsersIcon } from "../../../icons/Icons";

export const ADMIN_MENU: AdminMenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    type: "item",
    icon: ChartBarIcon,
    path: "/",
    requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
    order: 1,
  },

  {
    id: "product",
    title: "Product",
    type: "group",
    icon: Package,
    requiredPermissions: [
      PERMISSIONS.PRODUCT_LIST,
      PERMISSIONS.PRODUCT_CREATE,
      PERMISSIONS.PRODUCT_SELLER_LIST,
    ],
    order: 3,
    children: [
      {
        id: "product-add",
        title: "Add Product",
        type: "item",
        path: "/product/add",
        requiredPermissions: [PERMISSIONS.PRODUCT_CREATE],
      },
      {
        id: "product-manage",
        title: "Manage Product",
        type: "item",
        path: "/product/manage",
        requiredPermissions: [PERMISSIONS.PRODUCT_LIST],
      },
      {
        id: "product-sellers",
        title: "Sellers Product",
        type: "item",
        path: "/product/sellers",
        requiredPermissions: [PERMISSIONS.PRODUCT_SELLER_LIST],
      },
    ],
  },

  {
    id: "lbl-user",
    title: "User Management",
    type: "label",
    order: 3.5,
  },
  {
    id: "stores",
    title: "Stores",
    type: "group",
    icon: ShoppingCart,
    requiredPermissions: [
      PERMISSIONS.WHOLESALER_LIST,
      PERMISSIONS.RETAILER_LIST,
      PERMISSIONS.RESTAURANT_LIST,
      PERMISSIONS.INACTIVE_STORE_LIST,
    ],
    order: 4,
    children: [
      {
        id: "user-wholesaler",
        title: "Wholesaler",
        type: "item",
        path: "/user/wholesaler",
        requiredPermissions: [PERMISSIONS.WHOLESALER_LIST],
      },
      {
        id: "user-retailer",
        title: "Retailer",
        type: "item",
        path: "/user/retailer",
        requiredPermissions: [PERMISSIONS.RETAILER_LIST],
      },
      {
        id: "user-restaurant",
        title: "Restaurant",
        type: "item",
        path: "/user/restaurant",
        requiredPermissions: [PERMISSIONS.RESTAURANT_LIST],
      },
      {
        id: "user-inactive",
        title: "Inactive Store",
        type: "item",
        path: "/user/inactive-store",
        requiredPermissions: [PERMISSIONS.INACTIVE_STORE_LIST],
      },
    ],
  },

  {
    id: "employee",
    title: "Employee",
    type: "group",
    icon: Link2,
    requiredPermissions: [
      PERMISSIONS.EMPLOYEE_LIST,
      PERMISSIONS.EMPLOYEE_CREATE,
    ],
    order: 5,
    children: [
      {
        id: "employee-add",
        title: "Add Employee",
        type: "item",
        path: "/employee/add",
        requiredPermissions: [PERMISSIONS.EMPLOYEE_CREATE],
      },
      {
        id: "employee-manage",
        title: "Manage Employee",
        type: "item",
        path: "/employee/manage",
        requiredPermissions: [PERMISSIONS.EMPLOYEE_LIST],
      },
    ],
  },

  {
    id: "users",
    title: "Users",
    type: "group",
    icon: UsersIcon,
    requiredPermissions: [
      PERMISSIONS.USER_LIST,
      PERMISSIONS.USER_INACTIVE_LIST,
    ],
    order: 6,
    children: [
      {
        id: "users-manage",
        title: "Manage Users",
        type: "item",
        path: "/users/manage",
        requiredPermissions: [PERMISSIONS.USER_LIST],
      },
      {
        id: "users-inactive",
        title: "InActive Users",
        type: "item",
        path: "/users/inactive",
        requiredPermissions: [PERMISSIONS.USER_INACTIVE_LIST],
      },
    ],
  },

  {
    id: "lbl-report",
    title: "Reports & Analytics",
    type: "label",
    order: 6.5,
  },
  {
    id: "report",
    title: "Report",
    type: "group",
    icon: FileText,
    requiredPermissions: [
      PERMISSIONS.PAYINOUT_REPORT_LIST,
      PERMISSIONS.EMPLOYEE_REPORT_LIST,
      PERMISSIONS.INVOICE_REPORT_LIST,
      PERMISSIONS.WITHDRAW_REPORT_LIST,
    ],
    order: 7,
    children: [
      {
        id: "report-payinout",
        title: "Pay in/out Report",
        type: "item",
        path: "/report/payinout",
        requiredPermissions: [PERMISSIONS.PAYINOUT_REPORT_LIST],
      },
      {
        id: "employee-report",
        title: "Employee Report",
        type: "item",
        path: "/report/employee-report",
        requiredPermissions: [PERMISSIONS.EMPLOYEE_REPORT_LIST],
      },
      {
        id: "invoice-report",
        title: "Invoice Report",
        type: "item",
        path: "/report/invoice-report",
        requiredPermissions: [PERMISSIONS.INVOICE_REPORT_LIST],
      },
      {
        id: "withdraw-report",
        title: "Withdraw Report",
        type: "item",
        path: "/report/withdraw-report",
        requiredPermissions: [PERMISSIONS.WITHDRAW_REPORT_LIST],
      },
    ],
  },

  {
    id: "lbl-settings",
    title: "System & Settings",
    type: "label",
    order: 8.5,
  },
  {
    id: "setting",
    title: "Setting",
    type: "group",
    icon: Settings,
    requiredPermissions: [
      PERMISSIONS.CONTACT_REQUEST_LIST,
      PERMISSIONS.WEB_SUBSCRIBER_LIST,
      PERMISSIONS.WITHDRAW_REPORT_LIST,
      PERMISSIONS.ADMIN_SETTINGS_VIEW,
    ],
    order: 10,
    children: [
      {
        id: "setting-contacted-by-web",
        title: "Contacted By Web",
        type: "item",
        path: "/setting/contacted-by-web",
        requiredPermissions: [PERMISSIONS.CONTACT_REQUEST_LIST],
      },
      {
        id: "setting-web-subscribe",
        title: "Web Subscribe",
        type: "item",
        path: "/setting/web-subscribe",
        requiredPermissions: [PERMISSIONS.WEB_SUBSCRIBER_LIST],
      },
      {
        id: "setting-withdraw",
        title: "Withdraw",
        type: "item",
        path: "/setting/withdraw",
        requiredPermissions: [PERMISSIONS.WITHDRAW_REPORT_LIST],
      },
      {
        id: "admin-settings",
        title: "Admin Settings",
        type: "item",
        path: "/setting/admin-settings",
        requiredPermissions: [PERMISSIONS.ADMIN_SETTINGS_VIEW],
      },
    ],
  },

  {
    id: "promotion",
    title: "Promotion",
    type: "group",
    icon: Megaphone,
    requiredPermissions: [
      PERMISSIONS.PROMOTION_LIST,
      PERMISSIONS.PROMOTION_CREATE,
    ],
    order: 11,
    children: [
      {
        id: "promotion-add",
        title: "Add Promotion",
        type: "item",
        path: "/promotion/add",
        requiredPermissions: [PERMISSIONS.PROMOTION_CREATE],
      },
      {
        id: "promotion-manage",
        title: "Manage Promotion",
        type: "item",
        path: "/promotion/manage",
        requiredPermissions: [PERMISSIONS.PROMOTION_LIST],
      },
    ],
  },

  {
    id: "role",
    title: "Role",
    type: "group",
    icon: ShieldCheck,
    requiredPermissions: [PERMISSIONS.ROLE_LIST, PERMISSIONS.ROLE_CREATE],
    order: 10.5,
    children: [
      {
        id: "role-manage",
        title: "Manage Role",
        type: "item",
        path: "/role/manage",
        requiredPermissions: [PERMISSIONS.ROLE_LIST],
      },
      {
        id: "role-add",
        title: "Create Role",
        type: "item",
        path: "/role/add",
        requiredPermissions: [PERMISSIONS.ROLE_CREATE],
      },
    ],
  },

  {
    id: "lbl-content",
    title: "Support & Content",
    type: "label",
    order: 13.5,
  },
  {
    id: "support-hub",
    title: "Support Hub",
    type: "group",
    icon: Headphones,
    requiredPermissions: [
      PERMISSIONS.SUPPORT_RESOURCE_LIST,
      PERMISSIONS.SUPPORT_ARTICLE_LIST,
      PERMISSIONS.SUPPORT_CHATBOT_MANAGE,
      PERMISSIONS.SUPPORT_LEARNING_VIDEO_LIST,
    ],
    order: 14,
    children: [
      {
        id: "support-resource",
        title: "Resource",
        type: "item",
        path: "/support/resource",
        requiredPermissions: [PERMISSIONS.SUPPORT_RESOURCE_LIST],
      },
      {
        id: "support-article",
        title: "Article",
        type: "item",
        path: "/support/article",
        requiredPermissions: [PERMISSIONS.SUPPORT_ARTICLE_LIST],
      },
      {
        id: "support-chatbot",
        title: "Chatbot",
        type: "item",
        path: "/support/chatbot",
        requiredPermissions: [PERMISSIONS.SUPPORT_CHATBOT_MANAGE],
      },
      {
        id: "support-learning-video",
        title: "Learning Video",
        type: "item",
        path: "/support/learning-video",
        requiredPermissions: [PERMISSIONS.SUPPORT_LEARNING_VIDEO_LIST],
      },
    ],
  },

  {
    id: "blog",
    title: "Blog",
    type: "group",
    icon: NotebookPen,
    requiredPermissions: [
      PERMISSIONS.BLOG_CATEGORY_LIST,
      PERMISSIONS.BLOG_LIST,
      PERMISSIONS.BLOG_CREATE,
    ],
    order: 15,
    children: [
      {
        id: "blog-category",
        title: "Blog Category",
        type: "item",
        path: "/blog/category",
        requiredPermissions: [PERMISSIONS.BLOG_CATEGORY_LIST],
      },
      {
        id: "blog-add",
        title: "Add Blog",
        type: "item",
        path: "/blog/post/add",
        requiredPermissions: [PERMISSIONS.BLOG_CREATE],
      },
      {
        id: "blog-manage",
        title: "Manage Blog",
        type: "item",
        path: "/blog/post/manage",
        requiredPermissions: [PERMISSIONS.BLOG_LIST],
      },
    ],
  },

  {
    id: "hiring",
    title: "Hiring Deck",
    type: "group",
    icon: BriefcaseBusiness,
    requiredPermissions: [
      PERMISSIONS.JOB_CATEGORY_LIST,
      PERMISSIONS.SERVICE_CATEGORY_LIST,
      PERMISSIONS.HIRING_LIST,
      PERMISSIONS.HIRING_CREATE,
    ],
    order: 16,
    children: [
      {
        id: "hiring-category",
        title: "Hiring Category",
        type: "item",
        path: "/hiring/category",
        requiredPermissions: [PERMISSIONS.JOB_CATEGORY_LIST],
      },
      {
        id: "hiring-add",
        title: "Add Hiring",
        type: "item",
        path: "/hiring/add",
        requiredPermissions: [PERMISSIONS.HIRING_CREATE],
      },
      {
        id: "hiring-manage",
        title: "Manage Hiring",
        type: "item",
        path: "/hiring/manage",
        requiredPermissions: [PERMISSIONS.HIRING_LIST],
      },
      {
        id: "hiring-applications",
        title: "Applications",
        type: "item",
        path: "/hiring/applications",
        requiredPermissions: [PERMISSIONS.HIRING_LIST],
      },
    ],
  },
];
