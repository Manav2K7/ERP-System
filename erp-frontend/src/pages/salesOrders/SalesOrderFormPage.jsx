import { useEffect, useMemo, useState } from "react";
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
import OrderLineItemsEditor from "../../components/common/OrderLineItemsEditor";
import salesOrderApi, {
  fetchCustomerOptions,
  fetchProductOptions,
} from "../../api/salesOrderApi";
import { formatCurrency } from "../../utils/formatters";

/**
 * Sales Order create form (F3). Header (customer) + OrderLineItemsEditor
 * lines. Totals are NOT sent to the backend — the server recalculates from
 * current prices (rules.md §2); the number shown here is an estimate only.
 */
export default function SalesOrderFormPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchCustomerOptions(), fetchProductOptions()])
      .then(([c, p]) => {
        setCustomers(c);
        setProducts(p);
      })
      .catch((err) => setError(err.message || "Failed to load form data"));
  }, []);

  const estimatedTotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = products.find((p) => String(p.id) === String(line.productId));
      const qty = Number(line.quantity) || 0;
      return sum + (product ? product.unitPrice * qty : 0);
    }, 0);
  }, [lines, products]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!customerId) {
      setError("Select a customer");
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
      await salesOrderApi.create({ customerId: Number(customerId), items: normalized });
      navigate("/sales-orders");
    } catch (err) {
      setError(err.message || "Failed to create sales order");
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 860 }}>
        <Typography variant="h6" gutterBottom>
          New sales order
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={submit} noValidate>
          <Stack spacing={3}>
            <TextField
              select
              required
              label="Customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              sx={{ maxWidth: 420 }}
              size="small"
            >
              {customers.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>

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

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Estimated total (final total is calculated by the server):
              </Typography>
              <Typography variant="h6">{formatCurrency(estimatedTotal)}</Typography>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => navigate("/sales-orders")} disabled={saving}>
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
