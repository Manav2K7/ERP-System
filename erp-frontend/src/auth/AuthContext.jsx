import { createContext, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import authApi from "../api/authApi";
import { saveAuth, loadAuth, clearAuth } from "./authStorage";

/**
 * THE AuthContext for user/role/token state (rules.md §1: no duplicate auth
 * state anywhere else). Wrap the app in <AuthProvider>; consume via useAuth().
 *
 * - On mount, restores a previously persisted session (localStorage).
 * - login/register persist { token, user } and put the token in storage so the
 *   Axios request interceptor can attach it to every subsequent request.
 * - logout clears storage; the router sends the user to /login.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadAuth());
  // True once the initial restore attempt has finished — used to avoid
  // redirecting during the first paint on refresh.
  const [initialized, setInitialized] = useState(true);

  const login = useCallback(async (credentials) => {
    const next = await authApi.login(credentials);
    saveAuth(next.token, next.user);
    setSession(next);
    return next.user;
  }, []);

  const register = useCallback(async (payload) => {
    const next = await authApi.register(payload);
    saveAuth(next.token, next.user);
    setSession(next);
    return next.user;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setSession(null);
  }, []);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    return {
      user,
      token: session?.token ?? null,
      role: user?.role ?? null,
      isAuthenticated: Boolean(session?.token),
      initialized,
      login,
      register,
      logout,
    };
  }, [session, initialized, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
