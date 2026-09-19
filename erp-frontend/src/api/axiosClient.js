import axios from "axios";
import { clearAuth } from "../auth/authStorage";

/**
 * THE one Axios client for the entire app (rules.md §1: no module may create
 * its own instance). Every api/* module imports this client.
 *
 * - Request interceptor: attaches the JWT as `Authorization: Bearer <token>`.
 * - Response interceptor: on 401 (expired/invalid token), clears stored auth
 *   and redirects to /login, remembering the attempted location.
 * - Normalizes backend ErrorResponse payloads into a single error shape:
 *   { status, message, fieldErrors: [{ field, message }] }.
 */

// Same-origin "/api" by default — vite.config.js proxies it to the backend in dev.
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const axiosClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// ---- Request interceptor: attach JWT ---------------------------------------
axiosClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem("erp.token");
  if (raw) {
    config.headers.Authorization = `Bearer ${raw}`;
  }
  return config;
});

// ---- Response interceptor: 401 handling + error normalization ---------------
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      clearAuth();
      const attempted = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.replace(`/login?next=${attempted}`);
      // Return a never-resolving promise so the original caller stays pending
      // while the navigation happens.
      return new Promise(() => {});
    }

    const normalized = new Error(data?.message || error.message || "Request failed");
    normalized.status = status;
    normalized.fieldErrors = Array.isArray(data?.fieldErrors)
      ? data.fieldErrors.map((f) => ({ field: f.field, message: f.message }))
      : [];
    return Promise.reject(normalized);
  }
);

export default axiosClient;
