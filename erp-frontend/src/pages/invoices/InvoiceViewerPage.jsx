import { useState } from "react";
import {
  Button,
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
import DownloadIcon from "@mui/icons-material/Download";
import StatusChip from "../../components/common/StatusChip"; // reused from F3
import invoiceApi from "../../api/invoiceApi";
import { formatCurrency, formatDate } from "../../utils/formatters";

/**
 * Invoice viewer (F6). Opened from the invoice list; shows all header fields,
 * line items, and totals; PDF download via the shared invoiceApi (Blob so the
 * JWT is attached). Status transitions live on the list page menu.
 */
export default function InvoiceViewerPage({ open, invoice, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!invoice) return null;

  const download = async () => {
    setDownloading(true);
    try {
      await invoiceApi.downloadPdf(invoice.id);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Invoice #{invoice.id} <StatusChip status={invoice.status} />
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <div>
              <Typography variant="caption" color="text.secondary">Customer</Typography>
              <Typography variant="body2">{invoice.customerName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {invoice.customerEmail}
                {invoice.customerGstin ? ` · GSTIN ${invoice.customerGstin}` : ""}
              </Typography>
            </div>
            <div style={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary">Invoice date</Typography>
              <Typography variant="body2">{formatDate(invoice.invoiceDate)}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                From sales order #{invoice.salesOrderId}
              </Typography>
            </div>
          </Stack>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Qty</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Unit price</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Line total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(invoice.items || []).map((it, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {it.productName}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {it.productSku}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{it.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(it.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(it.lineTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack direction="row" justifyContent="flex-end" spacing={4}>
            <Typography variant="body2">Subtotal: {formatCurrency(invoice.subtotal)}</Typography>
            <Typography variant="body2">GST: {formatCurrency(invoice.taxAmount)}</Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Total payable: {formatCurrency(invoice.totalPayable)}</Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={download}
              disabled={downloading}
            >
              {downloading ? "Preparing…" : "Download PDF"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
