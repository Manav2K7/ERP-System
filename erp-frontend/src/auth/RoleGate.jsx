import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import { ROLE_LIST } from "./roles";

/**
 * THE UI-element role gate (rules.md §1: all role checks funnel through
 * RoleGate/ProtectedRoute, never scattered `if (user.role === 'ADMIN')`).
 * Usage:
 *
 *   <RoleGate roles={[CANONICAL_ROLES.ADMIN]}>
 *     <Button>Admin-only action</Button>
 *   </RoleGate>
 *
 * Renders `children` only when the current user's role is in `roles`.
 * Optional `fallback` renders instead when access is denied.
 */
export default function RoleGate({ roles, fallback = null, children }) {
  const { role } = useAuth();
  const allowed = Array.isArray(roles) ? roles.includes(role) : true;
  return allowed ? children : fallback;
}

RoleGate.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.oneOf(ROLE_LIST)).isRequired,
  fallback: PropTypes.node,
  children: PropTypes.node,
};
