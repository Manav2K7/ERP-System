import PartyListPage from "../common/PartyListPage";
import { CANONICAL_ROLES } from "../../auth/roles";

/**
 * Suppliers = the generic PartyListPage parameterized (F2). Shares 100% of
 * logic with CustomerListPage — no duplicated CRUD screens (rules.md §2).
 */
export default function SupplierListPage() {
  return (
    <PartyListPage
      resource="suppliers"
      title="Suppliers"
      writeRoles={[CANONICAL_ROLES.ADMIN, CANONICAL_ROLES.PURCHASE_MANAGER]}
      emptyMessage="No suppliers yet"
    />
  );
}
