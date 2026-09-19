import apiClient from "./axiosClient";

/**
 * Auth API — moved here in F1 (lived in axiosClient.js during F0 bootstrap).
 * Same functions, same behavior; AuthContext is the only consumer.
 */
function toSession(res) {
  const { token, email, fullName, role } = res.data;
  return {
    token,
    user: { email, fullName, role: role?.replace(/^ROLE_/, "") },
  };
}

const authApi = {
  async login({ email, password }) {
    const res = await apiClient.post("/auth/login", { email, password });
    return toSession(res);
  },

  async register({ fullName, email, password, role }) {
    // Backend Role enum values are ROLE_* — the UI's canonical names get the prefix here.
    const res = await apiClient.post("/auth/register", {
      fullName,
      email,
      password,
      role: role ? `ROLE_${role}` : undefined,
    });
    return toSession(res);
  },

  async changePassword({ currentPassword, newPassword }) {
    await apiClient.put("/auth/change-password", { currentPassword, newPassword });
  },
};

export default authApi;
