// src/config/permissions.ts

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.dashboard.view",

  DEPARTMENT_LIST: "catalog.department.list",
  DEPARTMENT_CREATE: "catalog.department.create",

  PRODUCT_LIST: "catalog.product.list",
  PRODUCT_CREATE: "catalog.product.create",
  PRODUCT_UPDATE: "catalog.product.update",
  PRODUCT_EXPIRATION_LIST: "catalog.expiration_product.list",
  PRODUCT_SELLER_LIST: "catalog.seller_product.list",

  USER_REQUEST_LIST: "users.user_request.list",
  USER_REQUEST_CREATE: "users.user_request.create",
  WHOLESALER_LIST: "users.wholesaler.list",
  RETAILER_LIST: "users.retailer.list",
  RESTAURANT_LIST: "users.restaurant.list",
  INACTIVE_STORE_LIST: "users.inactive_store.list",
  CONSUMER_LIST: "users.consumer.list",
  LOGIN_HISTORY_LIST: "users.login_history.list",
  INACTIVE_ACCOUNT_LIST: "users.inactive_account.list",
  EMPLOYEE_LIST: "users.employee.list",
  EMPLOYEE_CREATE: "users.employee.create",
  USER_LIST: "users.user.list",
  USER_INACTIVE_LIST: "users.inactive_user.list",

  CONNECT_REQUEST_LIST: "connect.connection_request.list",
  CONNECT_REQUEST_CREATE: "connect.connection_request.create",
  CONNECTED_ACCOUNT_LIST: "connect.connected_account.list",

  ORDER_LIST: "orders.order.list",
  ORDER_UPDATE: "orders.order.update",

  REPORT_LIST: "reports.report.list",
  ETIMESHEET_LIST: "reports.e_timesheet.list",
  EMPLOYEE_REPORT_LIST: "reports.employee_report.list",

  STOCK_LIST: "stock.stock.list",
  STOCK_UPDATE: "stock.stock.update",

  WHOLESALER_DUE_LIST: "accounts.wholesaler_due.list",
  RETAILER_DUE_LIST: "accounts.retailer_due.list",
  INVOICE_REPORT_LIST: "accounts.invoice_report.list",
  PAYINOUT_REPORT_LIST: "accounts.payinout_report.list",
  EPAY_REPORT_LIST: "accounts.epay_report.list",
  WITHDRAW_REPORT_LIST: "accounts.withdraw_report.list",
  BILLING_VIEW: "accounts.billing.view",

  CONTACT_REQUEST_LIST: "settings.contact_request.list",
  WEB_SUBSCRIBER_LIST: "settings.web_subscriber.list",
  VERIFICATION_LIST: "settings.verification.list",
  ADMIN_SETTINGS_VIEW: "settings.admin_settings.view",

  PROMOTION_LIST: "promotion.promotion.list",
  PROMOTION_CREATE: "promotion.promotion.create",

  ROLE_LIST: "access.role.list",
  ROLE_CREATE: "access.role.create",

  STORE_HUB_RETAILER_LIST: "store_hub.retailer.list",
  STORE_HUB_WHOLESALER_LIST: "store_hub.wholesaler.list",
  STORE_OWNER_CREATE: "store_hub.store_owner.create",

  SUPPORT_RESOURCE_LIST: "support.resource.list",
  SUPPORT_ARTICLE_LIST: "support.article.list",
  SUPPORT_CHATBOT_MANAGE: "support.chatbot.manage",
  SUPPORT_LEARNING_VIDEO_LIST: "support.learning_video.list",

  BLOG_CATEGORY_LIST: "blog.blog_category.list",
  BLOG_LIST: "blog.blog.list",
  BLOG_CREATE: "blog.blog.create",

  JOB_CATEGORY_LIST: "hiring.job_category.list",
  SERVICE_CATEGORY_LIST: "hiring.service_category.list",
  HIRING_LIST: "hiring.hiring.list",
  HIRING_CREATE: "hiring.hiring.create",

  HELP_CENTER_VIEW: "help_center.help_center.view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
