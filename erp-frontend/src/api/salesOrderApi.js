import apiClient from "./axiosClient";

/** Sales Orders API (F3) — over the ONE axios client. */
const salesOrderApi = {
  async list({ page = 0, size = 10, keyword } = {}) {
    const res = await apiClient.get("/sales-orders", {
      params: { page, size, keyword: keyword || undefined },
    });
    return res.data;
  },
  async getById(id) {
    const res = await apiClient.get(`/sales-orders/${id}`);
    return res.data;
  },
  async create(payload) {
    const res = await apiClient.post("/sales-orders", payload);
    return res.data;
  },
  async updateStatus(id, status) {
    // Backend reads the new status from a query param: PUT /{id}/status?status=X
    const res = await apiClient.put(`/sales-orders/${id}/status`, null, {
      params: { status },
    });
    return res.data;
  },
};

/** Lightweight customers lookup (id + name) for order forms. */
export async function fetchCustomerOptions() {
  const res = await apiClient.get("/customers", { params: { page: 0, size: 200 } });
  return (res.data.content || []).map((c) => ({ value: c.id, label: c.name }));
}

/** Lightweight products lookup for line-item editors (keeps stock/price info). */
export async function fetchProductOptions() {
  const res = await apiClient.get("/products", { params: { page: 0, size: 200 } });
  return (res.data.content || []).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unitPrice: Number(p.unitPrice),
    currentStock: p.currentStock,
  }));
}

export default salesOrderApi;
