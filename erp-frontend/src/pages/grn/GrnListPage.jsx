import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import grnApi from "../../api/grnApi";
import { formatDate } from "../../utils/formatters";

/** GRN list (F5) — reuses DataTable; details dialog shows received lines. */
export default function GrnListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await grnApi.list({ page, size: rowsPerPage, keyword });
      setRows(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load GRNs");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const openDetails = async (row) => {
    try {
      setDetails(await grnApi.getById(row.id));
    } catch (err) {
      setError(err.message || "Failed to load GRN");
    }
  };

  const columns = [
    { id: "id", label: "#", align: "center" },
    {
      id: "purchaseOrderId",
      label: "Purchase order",
      align: "center",
      render: (r) => `PO #${r.purchaseOrderId}`,
    },
    { id: "supplierName", label: "Supplier" },
    { id: "receivedDate", label: "Received date", render: (r) => formatDate(r.receivedDate) },
    {
      id: "__items",
      label: "Items",
      align: "center",
      render: (r) => (r.items ? r.items.length : "—"),
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
          <Typography variant="h6">Goods Receipt Notes</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search GRNs…"
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
              startIcon={<AddIcon />}
              onClick={() => navigate("/grns/new")}
            >
              New GRN
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
          emptyMessage="No GRNs yet"
        />
      </Paper>

      <Dialog open={Boolean(details)} onClose={() => setDetails(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          GRN #{details?.id} — PO #{details?.purchaseOrderId}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {details?.supplierName} · Received {formatDate(details?.receivedDate)}
            {details?.remarks ? ` · ${details.remarks}` : ""}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Qty received
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(details?.items || []).map((it, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {it.productName}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {it.productSku}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{it.quantityReceived}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
