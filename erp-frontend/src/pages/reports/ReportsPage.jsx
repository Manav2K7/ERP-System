import { useEffect, useState } from "react";
import { Box, Paper, Stack, TextField, Typography, Alert, Grid } from "@mui/material";
import dashboardApi from "../../api/dashboardApi";
import SummaryChart from "../../components/charts/SummaryChart"; // THE one chart wrapper
import RoleGate from "../../auth/RoleGate";
import { formatCurrency } from "../../utils/formatters";

/**
 * Reports (F7): date-filterable charts/tables. Sales view for ADMIN /
 * SALES_EXECUTIVE / ACCOUNTANT; purchase view for ADMIN / PURCHASE_MANAGER /
 * ACCOUNTANT — visibility handled by RoleGate, one shared chart component.
 */
export default function ReportsPage() {
  const [startDate, setStartDate] = useState(defaultStart());
  const [endDate, setEndDate] = useState(defaultEnd());
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [salesTotals, setSalesTotals] = useState(null);
  const [purchaseTotals, setPurchaseTotals] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const range = { startDate, endDate };

    Promise.allSettled([dashboardApi.salesSummary(range), dashboardApi.purchaseSummary(range)])
      .then(([sales, purch]) => {
        if (sales.status === "fulfilled") {
          setSalesData(
            (sales.value.dailySales || []).map((d) => ({
              date: d.date,
              sales: Number(d.salesAmount),
              orders: d.orderCount,
            }))
          );
          setSalesTotals(sales.value);
        }
        if (purch.status === "fulfilled") {
          setPurchaseData(
            (purch.value.dailyPurchases || []).map((d) => ({
              date: d.date,
              purchases: Number(d.purchaseAmount),
              orders: d.orderCount,
            }))
          );
          setPurchaseTotals(purch.value);
        }
        if (sales.status === "rejected" && purch.status === "rejected") {
          setError("Failed to load report data for this range");
        }
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="From"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {loading && <Typography variant="body2" alignSelf="center">Loading…</Typography>}
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <RoleGate roles={["ADMIN", "SALES_EXECUTIVE", "ACCOUNTANT"]}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Total sales: {formatCurrency(salesTotals?.totalSales)} ·{" "}
                {salesTotals?.totalOrders ?? 0} orders · avg{" "}
                {formatCurrency(salesTotals?.averageOrderValue)}
              </Typography>
              <SummaryChart
                title="Sales in range"
                data={salesData}
                xKey="date"
                series={[{ key: "sales", name: "Sales (₹)" }]}
                height={300}
              />
            </Stack>
          </Grid>
        </RoleGate>

        <RoleGate roles={["ADMIN", "PURCHASE_MANAGER", "ACCOUNTANT"]}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Total purchases: {formatCurrency(purchaseTotals?.totalPurchases)} ·{" "}
                {purchaseTotals?.totalOrders ?? 0} orders · avg{" "}
                {formatCurrency(purchaseTotals?.averageOrderValue)}
              </Typography>
              <SummaryChart
                title="Purchases in range"
                data={purchaseData}
                xKey="date"
                series={[{ key: "purchases", name: "Purchases (₹)" }]}
                height={300}
              />
            </Stack>
          </Grid>
        </RoleGate>
      </Grid>
    </Box>
  );
}

function defaultStart() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}
function defaultEnd() {
  return new Date().toISOString().slice(0, 10);
}
