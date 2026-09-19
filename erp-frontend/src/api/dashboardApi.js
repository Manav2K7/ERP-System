import apiClient from "./axiosClient";

/** Dashboard/Reports API (F7) — over the ONE axios client. */
const dashboardApi = {
  async summary() {
    const res = await apiClient.get("/dashboard/summary");
    return res.data;
  },
  async salesSummary({ startDate, endDate }) {
    const res = await apiClient.get("/dashboard/sales-summary", {
      params: { startDate, endDate },
    });
    return res.data;
  },
  async purchaseSummary({ startDate, endDate }) {
    const res = await apiClient.get("/dashboard/purchase-summary", {
      params: { startDate, endDate },
    });
    return res.data;
  },
  async stockAlerts() {
    const res = await apiClient.get("/dashboard/stock-alerts");
    return res.data;
  },
};

export default dashboardApi;
