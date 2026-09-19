import PartyListPage from "../common/PartyListPage";
import { CANONICAL_ROLES } from "../../auth/roles";

/**
 * Customers = the generic PartyListPage parameterized (F2). All CRUD logic
 * lives in pages/common/PartyListPage.jsx — this file only supplies config.
 */
export default function CustomerListPage() {
  return (
    <PartyListPage
      resource="customers"
      title="Customers"
      writeRoles={[CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.SALES_EXECUTIVE]}
      emptyMessage="No customers yet"
    />
  );
}
