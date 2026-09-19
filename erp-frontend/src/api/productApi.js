import apiClient from "./axiosClient";

/** Products API — every call goes through the ONE axios client. */
const productApi = {
  async list({ page = 0, size = 10, keyword } = {}) {
    const res = await apiClient.get("/products", {
      params: { page, size, keyword: keyword || undefined },
    });
    return res.data; // PagedResponse<ProductResponse>
  },

  async getById(id) {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  async getBySku(sku) {
    const res = await apiClient.get(`/products/sku/${encodeURIComponent(sku)}`);
    return res.data;
  },

  async create(payload) {
    const res = await apiClient.post("/products", payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await apiClient.put(`/products/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    await apiClient.delete(`/products/${id}`);
  },
};

export default productApi;
