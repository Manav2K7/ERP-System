import apiClient from "./axiosClient";

/** GRN API (F5) — over the ONE axios client. */
const grnApi = {
  async list({ page = 0, size = 10, keyword } = {}) {
    const res = await apiClient.get("/grns", {
      params: { page, size, keyword: keyword || undefined },
    });
    return res.data;
  },
  async getById(id) {
    const res = await apiClient.get(`/grns/${id}`);
    return res.data;
  },
  async listByPurchaseOrder(purchaseOrderId) {
    const res = await apiClient.get(`/grns/purchase-order/${purchaseOrderId}`, {
      params: { page: 0, size: 50 },
    });
    return res.data;
  },
  async create(payload) {
    const res = await apiClient.post("/grns", payload);
    return res.data;
  },
};

export default grnApi;
