import apiClient from "./axiosClient";

/** Invoices API (F6) — over the ONE axios client. */
const invoiceApi = {
  async list({ page = 0, size = 10, keyword } = {}) {
    const res = await apiClient.get("/invoices", {
      params: { page, size, keyword: keyword || undefined },
    });
    return res.data;
  },
  async getById(id) {
    const res = await apiClient.get(`/invoices/${id}`);
    return res.data;
  },
  async getBySalesOrderId(salesOrderId) {
    const res = await apiClient.get(`/invoices/sales-order/${salesOrderId}`);
    return res.data;
  },
  async generate(salesOrderId) {
    const res = await apiClient.post(`/invoices/generate/${salesOrderId}`);
    return res.data;
  },
  async updateStatus(id, status) {
    const res = await apiClient.put(`/invoices/${id}/status`, null, { params: { status } });
    return res.data;
  },
  /** Downloads the PDF as a Blob (JWT attached by the shared client) and
   * triggers a browser save. Blob avoids an unauthenticated direct GET. */
  async downloadPdf(id) {
    const res = await apiClient.get(`/invoices/${id}/pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default invoiceApi;
