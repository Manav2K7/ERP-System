import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusChip from "../../components/common/StatusChip";
import OrderDetailsDialog from "../common/OrderDetailsDialog";
import RoleGate from "../../auth/RoleGate";
import { useAuth } from "../../auth/AuthContext";
import salesOrderApi from "../../api/salesOrderApi";
import { allowedNext, SALES_TRANSITIONS } from "../../utils/statusTransitions";
import { formatCurrency, formatDateTime, formatEnum } from "../../utils/formatters";
import { CANONICAL_ROLES } from "../../auth/roles";

const STATUS_ROLES = [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.SALES_EXECUTIVE];

/** Sales Order list (F3) — reference for the Purchase Order list (F4). */
export default function SalesOrderListPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [details, setDetails] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesOrderApi.list({ page, size: rowsPerPage, keyword });
      setRows(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const applyStatus = async () => {
    setUpdating(true);
    setUpdateError(null);
    try {
      await salesOrderApi.updateStatus(statusTarget.order.id, statusTarget.next);
      setStatusTarget(null);
      fetchRows();
    } catch (err) {
      setUpdateError(err.message || "Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  const openDetails = async (row) => {
    try {
      const full = await salesOrderApi.getById(row.id);
      setDetails({
        id: full.id,
        kind: "sales",
        partyLabel: "Customer",
        partyName: full.customerName,
        dateLabel: "Order date",
        date: full.orderDate,
        status: full.status,
        totalAmount: full.totalAmount,
        items: (full.items || []).map((it) => ({
          productName: it.productName,
          productSku: it.productSku,
          quantity: it.quantity,
          unitPriceAtOrder: it.unitPriceAtOrder,
          lineTotal: it.lineTotal,
        })),
      });
    } catch (err) {
      setError(err.message || "Failed to load order details");
    }
  };

  const columns = [
    { id: "id", label: "#", align: "center" },
    { id: "customerName", label: "Customer" },
    { id: "orderDate", label: "Order date", render: (r) => formatDateTime(r.orderDate) },
    { id: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
    {
      id: "totalAmount",
      label: "Total",
      align: "right",
      render: (r) => formatCurrency(r.totalAmount),
    },
    {
      id: "__statusAction",
      label: "Update status",
      align: "center",
      render: (r) =>
        STATUS_ROLES.includes(role) && allowedNext(SALES_TRANSITIONS, r.status).length > 0 ? (
          <TextField
            select
            size="small"
            value=""
            displayEmpty
            sx={{ minWidth: 170 }}
            onChange={(e) => {
              if (e.target.value) setStatusTarget({ order: r, next: e.target.value });
            }}
          >
            <MenuItem value="" disabled>
              Move to…
            </MenuItem>
            {allowedNext(SALES_TRANSITIONS, r.status).map((s) => (
              <MenuItem key={s} value={s}>
                {formatEnum(s)}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Sales orders</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search orders…"
              value={keyword}
              onChange={(e) => {
                setPage(0);
                setKeyword(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <RoleGate roles={[CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.SALES_EXECUTIVE]}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/sales-orders/new")}
              >
                New order
              </Button>
            </RoleGate>
          </Stack>
        </Stack>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        <DataTable
          columns={columns}
          rows={rows.map((r) => ({
            ...r,
            __actions: (
              <Button size="small" onClick={() => openDetails(r)}>
                View
              </Button>
            ),
          }))}
          totalElements={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setPage(0);
            setRowsPerPage(Number(e.target.value));
          }}
          loading={loading}
          emptyMessage="No sales orders yet"
        />
      </Paper>

      <OrderDetailsDialog
        open={Boolean(details)}
        order={details}
        onClose={() => setDetails(null)}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title="Update order status"
        message={
          statusTarget
            ? `Move sales order #${statusTarget.order.id} to "${formatEnum(statusTarget.next)}"? This follows the server's allowed transitions.`
            : ""
        }
        confirmLabel="Update status"
        loading={updating}
        errorMessage={updateError}
        onCancel={() => setStatusTarget(null)}
        onConfirm={applyStatus}
      />
    </Box>
  );
}
