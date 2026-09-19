import apiClient from "./axiosClient";

/**
 * ONE generic party API for Customers AND Suppliers (rules.md §2: don't
 * duplicate the module — parameterize by resource). Both F2 screens import
 * createPartyApi("customers" | "suppliers").
 */
export function createPartyApi(resource) {
  return {
    async list({ page = 0, size = 10, keyword } = {}) {
      const res = await apiClient.get(`/${resource}`, {
        params: { page, size, keyword: keyword || undefined },
      });
      return res.data; // PagedResponse<PartyResponse>
    },
    async getById(id) {
      const res = await apiClient.get(`/${resource}/${id}`);
      return res.data;
    },
    async create(payload) {
      const res = await apiClient.post(`/${resource}`, payload);
      return res.data;
    },
    async update(id, payload) {
      const res = await apiClient.put(`/${resource}/${id}`, payload);
      return res.data;
    },
    async remove(id) {
      await apiClient.delete(`/${resource}/${id}`);
    },
  };
}

export const customerApi = createPartyApi("customers");
export const supplierApi = createPartyApi("suppliers");
