import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import StatusChip from "../../components/common/StatusChip";
import { formatCurrency, formatDate } from "../../utils/formatters";

/**
 * THE one order-details dialog (F3), reused by BOTH the Sales Order and
 * Purchase Order list pages (F4) via a `kind` prop — one component, not two.
 */
export default function OrderDetailsDialog({ open, order, onClose }) {
  if (!order) return null;
  const showMoney = order.kind === "sales";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {order.kind === "sales" ? "Sales" : "Purchase"} Order #{order.id}{" "}
        <StatusChip status={order.status} />
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={4}>
            <div>
              <Typography variant="caption" color="text.secondary">
                {order.partyLabel}
              </Typography>
              <Typography variant="body2">{order.partyName}</Typography>
            </div>
            <div>
              <Typography variant="caption" color="text.secondary">
                {order.dateLabel}
              </Typography>
              <Typography variant="body2">{formatDate(order.date)}</Typography>
            </div>
            {showMoney && (
              <div>
                <Typography variant="caption" color="text.secondary">Total</Typography>
                <Typography variant="body2">{formatCurrency(order.totalAmount)}</Typography>
              </div>
            )}
          </Stack>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  {order.items?.[0]?.quantityLabel || "Quantity"}
                </TableCell>
                {showMoney && <TableCell sx={{ fontWeight: 600 }} align="right">Unit price</TableCell>}
                {showMoney && <TableCell sx={{ fontWeight: 600 }} align="right">Line total</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {(order.items || []).map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {item.productName}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.productSku}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  {showMoney && <TableCell align="right">{formatCurrency(item.unitPriceAtOrder)}</TableCell>}
                  {showMoney && <TableCell align="right">{formatCurrency(item.lineTotal)}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {order.remarks && (
            <>
              <Divider />
              <Typography variant="body2">
                <strong>Remarks:</strong> {order.remarks}
              </Typography>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
