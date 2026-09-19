import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { CircularProgress, Stack } from "@mui/material";
import { useAuth } from "./AuthContext";
import { ROLE_LIST } from "./roles";

/**
 * THE route guard for every protected route (rules.md §1: don't hand-roll
 * auth/role checks per page). Usage:
 *
 *   <ProtectedRoute roles={[CANONICAL_ROLES.ADMIN]}>
 *     <DashboardPage />
 *   </ProtectedRoute>
 *
 * - Not authenticated → redirect to /login, preserving the attempted URL
 *   (readable after login via useSearchParams().get("next")).
 * - Authenticated but role not in `roles` → redirect to / (the layout shows a
 *   "not authorized" message for pages a role can't use).
 * - `roles` omitted → any authenticated user may pass.
 */
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, initialized, role } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "60vh" }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.oneOf(ROLE_LIST)),
  children: PropTypes.node.isRequired,
};
