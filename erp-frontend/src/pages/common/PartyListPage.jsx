import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAuth } from "../../auth/AuthContext";
import PartyFormDialog from "./PartyFormDialog";
import { createPartyApi } from "../../api/partyApi";
import { CANONICAL_ROLES } from "../../auth/roles";

/**
 * THE one generic Party list page (F2) — parameterized by resource/labels/
 * write-roles and reused for BOTH Customers and Suppliers (rules.md §2: not
 * two near-identical screens). Same structure as ProductListPage (F1).
 */
export default function PartyListPage({
  resource,
  title,
  writeRoles,
  emptyMessage,
}) {
  // Memoized so the api object identity is stable across renders. Without this,
  // createPartyApi() returns a fresh object every render, fetchRows' useCallback
  // deps change every render, and the fetch effect fires in an infinite loop —
  // which showed up as constant flickering on the Customers/Suppliers screens.
  const api = useMemo(() => createPartyApi(resource), [resource]);
  const { role } = useAuth();
  const canWrite = writeRoles.includes(role);

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
      const data = await api.list({ page, size: rowsPerPage, keyword });
      setRows(data.content || []);
      setTotal(data.totalElements || 0);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [api, page, rowsPerPage, keyword]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.remove(confirmRow.id);
      setConfirmRow(null);
      fetchRows();
    } catch (err) {
      setDeleteError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone", render: (r) => r.phone || "—" },
    { id: "gstin", label: "GSTIN", render: (r) => r.gstin || "—" },
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
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder={`Search ${title.toLowerCase()}…`}
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
            <RoleGate roles={writeRoles}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                Add {title.toLowerCase().replace(/s$/, "")}
              </Button>
            </RoleGate>
          </Stack>
        </Stack>

        <DataTable
          columns={columns}
          rows={rows.map((r) => ({
            ...r,
            __actions: canWrite ? (
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
                <RoleGate roles={[CANONICAL_ROLES.ADMIN]}>
                  <Button size="small" color="error" onClick={() => setConfirmRow(r)}>
                    Delete
                  </Button>
                </RoleGate>
              </Stack>
            ) : null,
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
          emptyMessage={emptyMessage}
        />
      </Paper>

      <PartyFormDialog
        open={dialogOpen}
        party={editing}
        title={title.toLowerCase().replace(/s$/, "")}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (values) => {
          if (editing) await api.update(editing.id, values);
          else await api.create(values);
          fetchRows();
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmRow)}
        title={`Delete ${title.toLowerCase().replace(/s$/, "")}`}
        message={`Delete "${confirmRow?.name}"? It will be deactivated.`}
        confirmLabel="Delete"
        loading={deleting}
        errorMessage={deleteError}
        onCancel={() => setConfirmRow(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
