import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import OrderLineItemsEditor from "../../components/common/OrderLineItemsEditor"; // reused from F3
import grnApi from "../../api/grnApi";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import { fetchProductOptions } from "../../api/salesOrderApi";
import { formatDate, formatEnum } from "../../utils/formatters";

/**
 * GRN create form (F5). Reuses OrderLineItemsEditor from F3 with
 * quantityLabel="Qty received". If opened as /grns/new?purchaseOrderId=ID
 * (from the Purchase Orders page), the PO's lines pre-populate the editor.
 * Submitting increments Product.currentStock server-side (@Transactional).
 */
export default function GrnFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPoId = searchParams.get("purchaseOrderId");

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [poId, setPoId] = useState(preselectedPoId || "");
  const [poInfo, setPoInfo] = useState(null);
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      purchaseOrderApi.list({ page: 0, size: 100 }),
      fetchProductOptions(),
    ])
      .then(([poPage, prods]) => {
        setPurchaseOrders(poPage.content || []);
        setProducts(prods);
      })
      .catch((err) => setError(err.message || "Failed to load form data"));
  }, []);

  // Load the selected PO's items and pre-fill the lines.
  useEffect(() => {
    if (!poId) {
      setPoInfo(null);
      setLines([]);
      return;
    }
    purchaseOrderApi
      .getById(poId)
      .then((po) => {
        setPoInfo(po);
        setLines(
          (po.items || []).map((it) => ({
            productId: it.productId,
            quantity: it.quantity, // default: full ordered quantity
          }))
        );
      })
      .catch((err) => setError(err.message || "Failed to load purchase order"));
  }, [poId]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!poId) {
      setError("Select a purchase order");
      return;
    }
    const normalized = lines
      .filter((l) => l.productId && Number(l.quantity) > 0)
      .map((l) => ({ productId: Number(l.productId), quantityReceived: Number(l.quantity) }));
    if (normalized.length === 0) {
      setError("Add at least one received quantity");
      return;
    }
    setSaving(true);
    try {
      await grnApi.create({
        purchaseOrderId: Number(poId),
        receivedDate, // YYYY-MM-DD
        remarks: remarks || undefined,
        items: normalized,
      });
      navigate("/grns");
    } catch (err) {
      setError(err.message || "Failed to submit GRN");
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 860 }}>
        <Typography variant="h6" gutterBottom>
          New GRN (Goods Receipt Note)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Submitting increments product stock — quantities are final.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={submit} noValidate sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                required
                label="Purchase order"
                value={poId}
                onChange={(e) => setPoId(e.target.value)}
                size="small"
                sx={{ maxWidth: 420 }}
                disabled={Boolean(preselectedPoId)}
                helperText={
                  poInfo
                    ? `${poInfo.supplierName} · ${formatEnum(poInfo.status)} · ${formatDate(poInfo.expectedDeliveryDate)}`
                    : "Only ORDERED / PARTIALLY_RECEIVED orders can receive goods"
                }
              >
                {purchaseOrders
                  .filter((po) => po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED")
                  .map((po) => (
                    <MenuItem key={po.id} value={po.id}>
                      #{po.id} — {po.supplierName} ({formatEnum(po.status)})
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                required
                label="Received date"
                type="date"
                size="small"
                sx={{ maxWidth: 220 }}
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <div>
              <Typography variant="subtitle2" gutterBottom>
                Received items
              </Typography>
              <OrderLineItemsEditor
                products={products}
                value={lines}
                onChange={setLines}
                quantityLabel="Qty received"
                addLabel="Add received item"
              />
            </div>

            <TextField
              label="Remarks (optional)"
              size="small"
              multiline
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => navigate("/grns")} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Submitting…" : "Submit GRN"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
