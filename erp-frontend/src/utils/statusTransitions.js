/**
 * THE one mirror of the backend's VALID_TRANSITIONS maps (SalesOrderServiceImpl,
 * PurchaseOrderServiceImpl, InvoiceServiceImpl). F3/F4/F6 status UIs derive
 * their "allowed next status" options from here — never re-declare per page.
 */

export const SALES_TRANSITIONS = {
  PENDING: ["APPROVED", "CANCELLED"],
  APPROVED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: [],
  CANCELLED: [],
};

export const PURCHASE_TRANSITIONS = {
  ORDERED: ["PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"],
  PARTIALLY_RECEIVED: ["RECEIVED", "CANCELLED"],
  RECEIVED: [],
  CANCELLED: [],
};

export const INVOICE_TRANSITIONS = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
};

export function allowedNext(transitions, status) {
  return transitions[status] || [];
}
