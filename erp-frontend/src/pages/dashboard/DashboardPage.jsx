import { useEffect, useState } from "react";
import { Box, Grid, Paper, Stack, Typography, Alert } from "@mui/material";
import RoleGate from "../../auth/RoleGate";
import dashboardApi from "../../api/dashboardApi";
import SummaryChart from "../../components/charts/SummaryChart";
import StatusChip from "../../components/common/StatusChip";
import DataTable from "../../components/common/DataTable";
import { formatCurrency, formatNumber } from "../../utils/formatters";

function KpiCard({ label, value, hint }) {
  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6">{value}</Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

/**
 * Role-aware Dashboard (F7). Widgets shown/hidden via RoleGate per the role
 * matrix. Every user sees at least one widget; ACCOUNTANT/ADMIN see everything.
 */
export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [salesDaily, setSalesDaily] = useState([]);
  const [purchaseDaily, setPurchaseDaily] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const end = new Date();
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const range = { startDate: fmt(start), endDate: fmt(end) };

    Promise.allSettled([
      dashboardApi.summary(),
      dashboardApi.salesSummary(range),
      dashboardApi.purchaseSummary(range),
      dashboardApi.stockAlerts(),
    ]).then(([s, sales, purch, alerts]) => {
      if (s.status === "fulfilled") setSummary(s.value);
      if (sales.status === "fulfilled") {
        setSalesDaily(
          (sales.value.dailySales || []).map((d) => ({
            date: d.date,
            sales: Number(d.salesAmount),
            orders: d.orderCount,
          }))
        );
      }
      if (purch.status === "fulfilled") {
        setPurchaseDaily(
          (purch.value.dailyPurchases || []).map((d) => ({
            date: d.date,
            purchases: Number(d.purchaseAmount),
            orders: d.orderCount,
          }))
        );
      }
      if (alerts.status === "fulfilled") setStockAlerts(alerts.value || []);
      if (
        s.status === "rejected" &&
        sales.status === "rejected" &&
        purch.status === "rejected" &&
        alerts.status === "rejected"
      ) {
        setError("Failed to load dashboard data");
      }
    });
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Dashboard
      </Typography>

      <RoleGate
        roles={["ADMIN", "ACCOUNTANT"]}
        fallback={
          <Alert severity="info" sx={{ mb: 2 }}>
            Financial summary is available to Admin and Accountant roles.
          </Alert>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard label="Sales this month" value={formatCurrency(summary?.totalSalesThisMonth)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              label="Purchases this month"
              value={formatCurrency(summary?.totalPurchasesThisMonth)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              label="Pending invoices"
              value={formatNumber(summary?.pendingInvoices)}
              hint={formatCurrency(summary?.pendingInvoiceAmount)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              label="Low / out of stock"
              value={`${formatNumber(summary?.lowStockProducts)} / ${formatNumber(summary?.outOfStockProducts)}`}
              hint={`${formatNumber(summary?.totalProducts)} products total`}
            />
          </Grid>
        </Grid>
      </RoleGate>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <RoleGate roles={["ADMIN", "SALES_EXECUTIVE", "ACCOUNTANT"]}>
          <Grid item xs={12} md={6}>
            <SummaryChart
              title="Daily sales — last 30 days"
              data={salesDaily}
              xKey="date"
              series={[{ key: "sales", name: "Sales (₹)" }]}
            />
          </Grid>
        </RoleGate>
        <RoleGate roles={["ADMIN", "PURCHASE_MANAGER", "ACCOUNTANT"]}>
          <Grid item xs={12} md={6}>
            <SummaryChart
              title="Daily purchases — last 30 days"
              data={purchaseDaily}
              xKey="date"
              series={[{ key: "purchases", name: "Purchases (₹)" }]}
            />
          </Grid>
        </RoleGate>
      </Grid>

      <RoleGate roles={["ADMIN", "INVENTORY_MANAGER"]}>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Stock alerts</Typography>
          <DataTable
            columns={[
              { id: "productSku", label: "SKU" },
              { id: "productName", label: "Product" },
              { id: "currentStock", label: "In stock", align: "center" },
              { id: "reorderLevel", label: "Reorder level", align: "center" },
              {
                id: "alertLevel",
                label: "Severity",
                align: "center",
                render: (r) => (
                  <StatusChip status={r.alertLevel === "OUT_OF_STOCK" ? "CANCELLED" : "PENDING"} />
                ),
              },
            ]}
            rows={stockAlerts.map((a) => ({ ...a, id: a.productId }))}
            totalElements={stockAlerts.length}
            page={0}
            rowsPerPage={Math.max(stockAlerts.length, 1)}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            loading={false}
            emptyMessage="No stock alerts"
          />
        </Stack>
      </RoleGate>
    </Box>
  );
}
