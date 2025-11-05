/**
 * Route configuration for easy management
 * Add new routes here as your app grows
 */

export interface RouteConfig {
  path: string;
  page: string;
  requiredAction?: string;
  title?: string;
}

export const protectedRouteConfigs: RouteConfig[] = [
  { path: "/dashboard", page: "all", title: "Dashboard" },
  {
    path: "/purchase-order/list",
    page: "PurchaseOrder",
    title: "Purchase Orders",
  },
  {
    path: "/purchase-order/create",
    page: "PurchaseOrder",
    requiredAction: "create",
  },
  { path: "/transactions", page: "Transaction", title: "Transactions" },
  { path: "/stores", page: "ReserveStore", title: "Stores" },
  {
    path: "/users",
    page: "user",
    requiredAction: "view",
    title: "User Management",
  },
  { path: "/profile", page: "profile", title: "User Profile" },
  { path: "/roles", page: "role", title: "Role Management" },
  { path: "/chat", page: "Chat", requiredAction: "view", title: "Support" },
  {
    path: "/reports",
    page: "Report",
    requiredAction: "view",
    title: "Reports & Analytics",
  },
  // Add more routes here...
];
