import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ModulePlaceholder from "../pages/common/ModulePlaceholder";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProductListPage from "../pages/products/ProductListPage";
import CustomerListPage from "../pages/customers/CustomerListPage";
import SupplierListPage from "../pages/suppliers/SupplierListPage";
import SalesOrderListPage from "../pages/salesOrders/SalesOrderListPage";
import SalesOrderFormPage from "../pages/salesOrders/SalesOrderFormPage";
import PurchaseOrderListPage from "../pages/purchaseOrders/PurchaseOrderListPage";
import PurchaseOrderFormPage from "../pages/purchaseOrders/PurchaseOrderFormPage";
import GrnListPage from "../pages/grn/GrnListPage";
import GrnFormPage from "../pages/grn/GrnFormPage";
import InvoiceListPage from "../pages/invoices/InvoiceListPage";
import ReportsPage from "../pages/reports/ReportsPage";
import { NAV_ITEMS } from "../components/layout/navItems";

/**
 * Route table (final, after F7). Every protected route goes through THE
 * ProtectedRoute; per-element visibility is handled by RoleGate inside pages.
 */
const PAGE_ROUTES = {
  "/products": ProductListPage,
  "/customers": CustomerListPage,
  "/suppliers": SupplierListPage,
  "/sales-orders": SalesOrderListPage,
  "/purchase-orders": PurchaseOrderListPage,
  "/grns": GrnListPage,
  "/invoices": InvoiceListPage,
  "/reports": ReportsPage,
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {NAV_ITEMS.filter((item) => item.path !== "/" && item.path !== "/dashboard").map((item) => {
          const Page = PAGE_ROUTES[item.path];
          if (Page) {
            return <Route key={item.path} path={item.path} element={<Page />} />;
          }
          return (
            <Route
              key={item.path}
              path={item.path}
              element={<ModulePlaceholder title={item.label} />}
            />
          );
        })}
        {/* Create/detail routes */}
        <Route path="/sales-orders/new" element={<SalesOrderFormPage />} />
        <Route path="/purchase-orders/new" element={<PurchaseOrderFormPage />} />
        <Route path="/grns/new" element={<GrnFormPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
