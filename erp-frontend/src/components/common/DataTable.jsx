import PropTypes from "prop-types";
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

/**
 * THE one reusable data table for every list screen (rules.md §1 — Products,
 * Customers, Suppliers, Sales Orders, Purchase Orders, GRNs, Invoices all use
 * this; never create a second table component).
 *
 * Server-driven pagination: the parent owns page/size/total and the fetch;
 * this component renders and emits page changes.
 *
 * Props:
 * - columns: [{ id, label, align?, render?(row) }]  (render falls back to row[id])
 * - rows, totalElements, page (0-based), rowsPerPage
 * - onPageChange(event, newPage), onRowsPerPageChange(event)
 * - loading, emptyMessage
 */
export default function DataTable({
  columns,
  rows,
  totalElements,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  emptyMessage = "No records found",
}) {
  const colCount = columns.length + 1; // +1 for the actions column

  return (
    <Box>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || "left"} sx={{ fontWeight: 600 }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={colCount} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} align="center" sx={{ py: 6 }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={row.id ?? idx} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || "left"}>
                      {col.render ? col.render(row) : row[col.id]}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    {row.__actions}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "right", "center"]),
      render: PropTypes.func,
    })
  ).isRequired,
  rows: PropTypes.array.isRequired,
  totalElements: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
};
