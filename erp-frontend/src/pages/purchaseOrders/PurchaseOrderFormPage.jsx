import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import purchaseOrderApi, { fetchSupplierOptions } from "../../api/purchaseOrderApi";
import { fetchProductOptions } from "../../api/salesOrderApi";

/**
 * Purchase Order create form (F4). Explicitly reuses OrderLineItemsEditor from
 * F3 — the only differences from the Sales form are: supplier instead of
 * customer, and expected delivery date.
 */
export default function PurchaseOrderFormPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchSupplierOptions(), fetchProductOptions()])
      .then(([s, p]) => {
        setSuppliers(s);
        setProducts(p);
      })
      .catch((err) => setError(err.message || "Failed to load form data"));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!supplierId) {
      setError("Select a supplier");
      return;
    }
    if (!expectedDate) {
      setError("Pick an expected delivery date");
      return;
    }
    const normalized = lines
      .filter((l) => l.productId && Number(l.quantity) > 0)
      .map((l) => ({ productId: Number(l.productId), quantity: Number(l.quantity) }));
    if (normalized.length === 0) {
      setError("Add at least one item with product and quantity");
      return;
    }
    setSaving(true);
    try {
      await purchaseOrderApi.create({
        supplierId: Number(supplierId),
        expectedDeliveryDate: expectedDate, // YYYY-MM-DD from <input type="date">
        items: normalized,
      });
      navigate("/purchase-orders");
    } catch (err) {
      setError(err.message || "Failed to create purchase order");
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 860 }}>
        <Typography variant="h6" gutterBottom>
          New purchase order
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={submit} noValidate>
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                required
                label="Supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                size="small"
                sx={{ maxWidth: 420 }}
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                label="Expected delivery"
                type="date"
                size="small"
                sx={{ maxWidth: 220 }}
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <div>
              <Typography variant="subtitle2" gutterBottom>
                Items
              </Typography>
              <OrderLineItemsEditor
                products={products}
                value={lines}
                onChange={setLines}
                quantityLabel="Quantity"
                addLabel="Add item"
              />
            </div>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => navigate("/purchase-orders")} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Creating…" : "Create order"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
