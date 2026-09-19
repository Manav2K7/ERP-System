import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupIcon from "@mui/icons-material/Group";
import { CANONICAL_ROLES, ROLE_LIST } from "../../auth/roles";

/**
 * THE role-aware navigation model. One array, driven by `roles` per item —
 * Sidebar renders it; F1–F7 only edit entries here (no new nav code per module).
 *
 * `enabled` marks modules whose UI exists; disabled items are hidden by
 * Sidebar until their phase lands.
 */
export const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon, roles: [...ROLE_LIST], enabled: true, phase: "F7" },
  { label: "Products", path: "/products", icon: Inventory2Icon, roles: [...ROLE_LIST], enabled: true, phase: "F1" },
  { label: "Customers", path: "/customers", icon: PeopleIcon, roles: [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.SALES_EXECUTIVE, CANONICAL_ROLES.ACCOUNTANT], enabled: true, phase: "F2" },
  { label: "Suppliers", path: "/suppliers", icon: LocalShippingIcon, roles: [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.PURCHASE_MANAGER, CANONICAL_ROLES.ACCOUNTANT], enabled: true, phase: "F2" },
  { label: "Sales Orders", path: "/sales-orders", icon: ShoppingCartIcon, roles: [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.SALES_EXECUTIVE, CANONICAL_ROLES.ACCOUNTANT], enabled: true, phase: "F3" },
  { label: "Purchase Orders", path: "/purchase-orders", icon: RequestQuoteIcon, roles: [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.PURCHASE_MANAGER, CANONICAL_ROLES.ACCOUNTANT], enabled: true, phase: "F4" },
  { label: "GRNs", path: "/grns", icon: ReceiptLongIcon, roles: [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.PURCHASE_MANAGER, CANONICAL_ROLES.INVENTORY_MANAGER], enabled: true, phase: "F5" },
  { label: "Invoices", path: "/invoices", icon: ReceiptLongIcon, roles: [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.SALES_EXECUTIVE, CANONICAL_ROLES.ACCOUNTANT], enabled: true, phase: "F6" },
  { label: "Reports", path: "/reports", icon: BarChartIcon, roles: [...ROLE_LIST], enabled: true, phase: "F7" },
  { label: "User Management", path: "/users", icon: GroupIcon, roles: [CANONICAL_ROLES.ADMIN], enabled: false, phase: "F8+" },
];
