import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import RoleGate from "../../auth/RoleGate";
import productApi from "../../api/productApi";
import ProductFormDialog from "./ProductFormDialog";
import { formatCurrency } from "../../utils/formatters";
import { CANONICAL_ROLES } from "../../auth/roles";

const WRITE_ROLES = [CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.INVENTORY_MANAGER];

/**
 * Product list — the reference implementation for every list screen (F1):
 * DataTable + search + RoleGate'd actions + ConfirmDialog for delete.
 * F2+ pages follow this exact structure with their own api module + columns.
 */
export default function ProductListPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmRow, setConfirmRow] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productApi.list({ page, size: rowsPerPage, keyword });
      setRows(data.content || []);
      setTotal(data.totalElements || 0);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await productApi.remove(confirmRow.id);
      setConfirmRow(null);
      fetchRows();
    } catch (err) {
      setDeleteError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { id: "name", label: "Product" },
    { id: "sku", label: "SKU" },
    { id: "category", label: "Category" },
    { id: "unitPrice", label: "Unit price", align: "right", render: (r) => formatCurrency(r.unitPrice) },
    {
      id: "currentStock",
      label: "Stock",
      align: "center",
      render: (r) =>
        r.currentStock <= 0 ? (
          <Chip size="small" color="error" label="Out of stock" />
        ) : r.lowStock ? (
          <Chip size="small" color="warning" label={`${r.currentStock} (low)`} />
        ) : (
          r.currentStock
        ),
    },
    { id: "reorderLevel", label: "Reorder level", align: "center" },
    {
      id: "__active",
      label: "Status",
      render: (r) => (
        <Chip size="small" label={r.active ? "Active" : "Inactive"} color={r.active ? "success" : "default"} />
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
          <Typography variant="h6">Products</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search name / SKU…"
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
            <RoleGate roles={WRITE_ROLES}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                Add product
              </Button>
            </RoleGate>
          </Stack>
        </Stack>

        <DataTable
          columns={columns}
          rows={rows.map((r) => ({
            ...r,
            __actions: (
              <RoleGate roles={WRITE_ROLES}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    onClick={() => {
                      setEditing(r);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => setConfirmRow(r)}>
                    Delete
                  </Button>
                </Stack>
              </RoleGate>
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
          emptyMessage="No products yet — add your first product"
        />
      </Paper>

      <ProductFormDialog
        open={dialogOpen}
        product={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (values) => {
          if (editing) await productApi.update(editing.id, values);
          else await productApi.create(values);
          fetchRows();
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmRow)}
        title="Delete product"
        message={`Delete "${confirmRow?.name}"? It will be deactivated and cannot be used on new orders.`}
        confirmLabel="Delete"
        loading={deleting}
        errorMessage={deleteError}
        onCancel={() => setConfirmRow(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
