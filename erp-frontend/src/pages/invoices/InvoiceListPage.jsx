import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusChip from "../../components/common/StatusChip"; // reused from F3
import InvoiceViewerPage from "./InvoiceViewerPage";
import { useAuth } from "../../auth/AuthContext";
import invoiceApi from "../../api/invoiceApi";
import salesOrderApi from "../../api/salesOrderApi";
import { allowedNext, INVOICE_TRANSITIONS } from "../../utils/statusTransitions";
import { formatCurrency, formatDateTime, formatEnum } from "../../utils/formatters";
import { CANONICAL_ROLES } from "../../auth/roles";

const GENERATE_ROLES = [
  CANONICAL_ROLES.ADMIN,
  CANONICAL_ROLES.SALES_EXECUTIVE,
  CANONICAL_ROLES.ACCOUNTANT,
];
const STATUS_ROLES = [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.ACCOUNTANT];

/** Invoice list (F6): generate from approved SOs, status management, PDF. */
export default function InvoiceListPage() {
  const { role } = useAuth();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewer, setViewer] = useState(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [selectedSoId, setSelectedSoId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const [statusTarget, setStatusTarget] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.list({ page, size: rowsPerPage, keyword });
      setRows(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const openGenerate = async () => {
    setGenerateOpen(true);
    setGenerateError(null);
    try {
      // Backend: only APPROVED or DISPATCHED sales orders can generate invoices,
      // and each SO can have only one invoice — filter client-side by status
      // and let the server reject duplicates with a clear 409 message.
      const page1 = await salesOrderApi.list({ page: 0, size: 100 });
      setApprovedOrders(
        (page1.content || []).filter((so) => so.status === "APPROVED" || so.status === "DISPATCHED")
      );
    } catch (err) {
      setGenerateError(err.message || "Failed to load sales orders");
    }
  };

  const generate = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      await invoiceApi.generate(Number(selectedSoId));
      setGenerateOpen(false);
      setSelectedSoId("");
      fetchRows();
    } catch (err) {
      setGenerateError(err.message || "Invoice generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const applyStatus = async () => {
    setUpdating(true);
    setUpdateError(null);
    try {
      await invoiceApi.updateStatus(statusTarget.invoice.id, statusTarget.next);
      setStatusTarget(null);
      fetchRows();
    } catch (err) {
      setUpdateError(err.message || "Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  const openViewer = async (row) => {
    try {
      setViewer(await invoiceApi.getById(row.id));
    } catch (err) {
      setError(err.message || "Failed to load invoice");
    }
  };

  const columns = [
    { id: "id", label: "#", align: "center" },
    { id: "customerName", label: "Customer" },
    {
      id: "salesOrderId",
      label: "Sales order",
      align: "center",
      render: (r) => `SO #${r.salesOrderId}`,
    },
    { id: "invoiceDate", label: "Invoice date", render: (r) => formatDateTime(r.invoiceDate) },
    { id: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
    {
      id: "totalPayable",
      label: "Total payable",
      align: "right",
      render: (r) => formatCurrency(r.totalPayable),
    },
    {
      id: "__statusAction",
      label: "Update status",
      align: "center",
      render: (r) =>
        STATUS_ROLES.includes(role) && allowedNext(INVOICE_TRANSITIONS, r.status).length > 0 ? (
          <TextField
            select
            size="small"
            value=""
            displayEmpty
            sx={{ minWidth: 150 }}
            onChange={(e) => {
              if (e.target.value) setStatusTarget({ invoice: r, next: e.target.value });
            }}
          >
            <MenuItem value="" disabled>
              Move to…
            </MenuItem>
            {allowedNext(INVOICE_TRANSITIONS, r.status).map((s) => (
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
          <Typography variant="h6">Invoices</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search invoices…"
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
            <Button
              variant="contained"
              onClick={openGenerate}
              disabled={!GENERATE_ROLES.includes(role)}
            >
              Generate from sales order
            </Button>
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
              <Button size="small" onClick={() => openViewer(r)}>
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
          emptyMessage="No invoices yet"
        />
      </Paper>

      <InvoiceViewerPage open={Boolean(viewer)} invoice={viewer} onClose={() => setViewer(null)} />

      {/* Generate invoice from an approved sales order */}
      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Generate invoice</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Pick an approved or dispatched sales order. Totals (incl. 18% GST) are
            calculated by the server.
          </DialogContentText>
          {generateError && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {generateError}
            </Typography>
          )}
          <TextField
            select
            fullWidth
            size="small"
            label="Sales order"
            value={selectedSoId}
            onChange={(e) => setSelectedSoId(e.target.value)}
          >
            {approvedOrders.map((so) => (
              <MenuItem key={so.id} value={so.id}>
                SO #{so.id} — {so.customerName} ({formatCurrency(so.totalAmount)},{" "}
                {formatEnum(so.status)})
              </MenuItem>
            ))}
            {approvedOrders.length === 0 && (
              <MenuItem value="" disabled>
                No approved sales orders available
              </MenuItem>
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateOpen(false)} disabled={generating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={generate} disabled={generating || !selectedSoId}>
            {generating ? "Generating…" : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title="Update invoice status"
        message={
          statusTarget
            ? `Mark invoice #${statusTarget.invoice.id} as "${formatEnum(statusTarget.next)}"?`
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
