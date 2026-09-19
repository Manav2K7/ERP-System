import apiClient from "./axiosClient";

/** Purchase Orders API (F4) — mirrors salesOrderApi; same ONE axios client. */
const purchaseOrderApi = {
  async list({ page = 0, size = 10, keyword } = {}) {
    const res = await apiClient.get("/purchase-orders", {
      params: { page, size, keyword: keyword || undefined },
    });
    return res.data;
  },
  async getById(id) {
    const res = await apiClient.get(`/purchase-orders/${id}`);
    return res.data;
  },
  async create(payload) {
    const res = await apiClient.post("/purchase-orders", payload);
    return res.data;
  },
  async updateStatus(id, status) {
    const res = await apiClient.put(`/purchase-orders/${id}/status`, null, {
      params: { status },
    });
    return res.data;
  },
};

/** Lightweight suppliers lookup (id + name) for PO/GRN forms. */
export async function fetchSupplierOptions() {
  const res = await apiClient.get("/suppliers", { params: { page: 0, size: 200 } });
  return (res.data.content || []).map((s) => ({ value: s.id, label: s.name }));
}

export default purchaseOrderApi;
