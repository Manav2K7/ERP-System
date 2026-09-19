const TOKEN_KEY = "erp.token";
const USER_KEY = "erp.user";

/** The ONE persistence helper for auth state — AuthContext is its only consumer. */

export function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    return user ? { token, user } : null;
  } catch {
    // Corrupt payload: treat as logged out rather than crash.
    clearAuth();
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
