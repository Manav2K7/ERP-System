import PropTypes from "prop-types";
import { useState } from "react";
import {
  Alert,
  Button,
  Divider,
  IconButton,
  MenuItem,
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
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * THE reusable line-items editor (built in F3, reused by Purchase Orders F4
 * and GRNs F5 via props). Rows are [product, quantity] pairs; the parent owns
 * state and receives every change through onChange.
 */
export default function OrderLineItemsEditor({
  products,
  value,
  onChange,
  quantityLabel = "Quantity",
  quantityMin = 1,
  quantityHint,
  addLabel = "Add item",
  error = null,
}) {
  const [localError, setLocalError] = useState(null);

  const lines = value.length > 0 ? value : [{ productId: "", quantity: "" }];
  const productById = Object.fromEntries(products.map((p) => [String(p.id), p]));

  const emit = (next) => {
    setLocalError(null);
    onChange(next);
  };

  const updateLine = (idx, patch) => {
    emit(value.map((line, i) => (i === idx ? { ...line, ...patch } : line)));
  };

  const addLine = () => emit([...value, { productId: "", quantity: "" }]);

  const removeLine = (idx) => {
    emit(value.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (value.length === 0) {
      const msg = "Add at least one item";
      setLocalError(msg);
      return msg;
    }
    for (const line of value) {
      if (!line.productId) {
        const msg = "Select a product for every line";
        setLocalError(msg);
        return msg;
      }
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty < quantityMin) {
        const msg = `Quantity must be at least ${quantityMin} on every line`;
        setLocalError(msg);
        return msg;
      }
    }
    const dupes = value.filter(
      (l, i) => value.findIndex((o) => String(o.productId) === String(l.productId)) !== i
    );
    if (dupes.length > 0) {
      const msg = "Duplicate products — merge them into one line";
      setLocalError(msg);
      return msg;
    }
    return null;
  };

  return (
    <Stack spacing={1}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, width: "50%" }}>Product</TableCell>
            <TableCell sx={{ fontWeight: 600, width: "25%" }}>{quantityLabel}</TableCell>
            <TableCell sx={{ width: 40 }} aria-label="remove" />
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line, idx) => {
            const selected = productById[String(line.productId)];
            return (
              <TableRow key={idx}>
                <TableCell>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={line.productId ?? ""}
                    onChange={(e) => updateLine(idx, { productId: e.target.value })}
                  >
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.sku ? `${p.sku} — ${p.name}` : p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {selected?.currentStock !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      In stock: {selected.currentStock}
                      {selected.unitPrice !== undefined &&
                        ` · ₹${Number(selected.unitPrice).toFixed(2)}`}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: quantityMin }}
                    placeholder={quantityHint}
                    value={line.quantity ?? ""}
                    onChange={(e) =>
                      updateLine(idx, {
                        quantity: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    aria-label="Remove line"
                    onClick={() => removeLine(idx)}
                    disabled={value.length === 0}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {(localError || error) && <Alert severity="error">{localError || error}</Alert>}

      <Divider />
      <div>
        <Button size="small" startIcon={<AddIcon />} onClick={addLine}>
          {addLabel}
        </Button>
      </div>
    </Stack>
  );
}

OrderLineItemsEditor.propTypes = {
  products: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  quantityLabel: PropTypes.string,
  quantityMin: PropTypes.number,
  quantityHint: PropTypes.string,
  addLabel: PropTypes.string,
  error: PropTypes.string,
};
