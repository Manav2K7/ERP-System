/**
 * The ONE place where raw backend role strings are translated to/from the
 * canonical names the UI uses everywhere (AuthContext, RoleGate, Sidebar).
 * The backend Role enum serializes as "ROLE_ADMIN", "ROLE_SALES_EXECUTIVE", …
 *
 * CANONICAL_ROLES is a name -> value map (CANONICAL_ROLES.ADMIN === "ADMIN")
 * because that's how every consumer uses it. ROLE_LIST is the plain array of
 * values for iteration/validation (Yup oneOf, PropTypes.oneOf, .map()).
 */

export const CANONICAL_ROLES = Object.freeze({
  ADMIN: "ADMIN",
  SALES_EXECUTIVE: "SALES_EXECUTIVE",
  PURCHASE_MANAGER: "PURCHASE_MANAGER",
  INVENTORY_MANAGER: "INVENTORY_MANAGER",
  ACCOUNTANT: "ACCOUNTANT",
});

/** Plain array of the canonical role values, derived from the map. */
export const ROLE_LIST = Object.freeze(Object.values(CANONICAL_ROLES));

export function fromBackendRole(raw) {
  return raw ? raw.replace(/^ROLE_/, "") : null;
}

export function toBackendRole(canonical) {
  return canonical ? `ROLE_${canonical}` : null;
}
