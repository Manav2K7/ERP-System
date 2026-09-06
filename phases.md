# Phases — ERP System for Inventory and Sales Management

This file only describes *what* each phase builds and *why*. The actual AI prompts to run for each phase live in the separate `prompts.md` file — copy the matching prompt from there (along with `architecture.md` and `rules.md`) when you reach that phase.

**Ordering:** All backend phases are completed first (a fully working, testable REST API with Swagger/Postman), then all frontend phases build the React UI against that finished API. Do not skip ahead — each phase assumes every previous one compiles, runs, and passes its tests.

> Note: `prompts.md` currently follows the old backend+frontend-per-module ordering. It needs to be regenerated to match this backend-first / frontend-second structure before you start — ask for that separately if you haven't already.

---

## PART A — BACKEND PHASES

### Phase B0 — Backend Project Setup
Bootstrap the Spring Boot project: Maven config, dependencies, package skeleton, database connection config, `.gitignore`, README. No business logic yet. Also creates the ONE shared `PagedResponse` and `ErrorResponse` that every later module reuses.

### Phase B1 — Backend Authentication
User entity, roles (5 roles), register/login endpoints, JWT issuance/validation, Spring Security config, the ONE global exception handler. This is the foundation every other backend module depends on.

### Phase B2 — Product Management API
Full CRUD for products: entity, repository, service, controller, validation, pagination/search, role-based access.

### Phase B3 — Customer & Supplier Management API
Customer and Supplier CRUD, built as a single generic "Party" pattern (shared DTO shape/validation) rather than two duplicated modules.

### Phase B4 — Sales Order Module API
Sales Order entity + line items, status workflow (Pending → Approved → Dispatched), server-side total calculation from current product prices, list/create/status-update endpoints.

### Phase B5 — Purchase Order Module API
Purchase Order entity + line items, status workflow (Ordered → Received), list/create/status-update endpoints — explicitly mirrors the Sales Order pattern from B4 (same DTO shapes, same service structure) rather than reinventing it.

### Phase B6 — GRN Module API
GRN entity + items referencing a Purchase Order, the transactional stock-increment logic (GRN submission → Product.currentStock update), list/create endpoints.

### Phase B7 — Invoice Generation API
Invoice entity, auto-generation from an approved Sales Order (server-recalculated tax/total, never trusts client input), invoice list endpoint, PDF generation endpoint via the ONE shared `PdfGenerator` utility.

### Phase B8 — Dashboard & Reporting API
Sales summary, purchase summary, and stock-alert aggregation endpoints, with role-appropriate visibility and optional date-range filtering.

### Phase B9 — Backend Testing, Swagger & Postman Finalization
Complete Swagger annotations on every controller, JUnit+Mockito unit tests for every service (success + key failure paths), `@WebMvcTest` controller tests, the full Postman collection covering every endpoint across all modules, and a duplication audit against `rules.md` (one exception handler, one PagedResponse, no copy-pasted Customer/Supplier or Sales/Purchase Order code). Backend is considered "done" and frozen after this phase — the entire API should be usable and testable via Swagger/Postman alone before any frontend work begins.

---

## PART B — FRONTEND PHASES

### Phase F0 — Frontend Project Setup + Auth UI
Bootstrap the React project: routing, the ONE Axios client with JWT interceptor, MUI theme, `AuthContext`, `ProtectedRoute`/`RoleGate`, Login/Register pages, base `AppLayout` with a role-aware `Sidebar` (nav items stubbed for modules that don't have pages yet). Connects to the now-complete backend from Part A.

### Phase F1 — Shared UI Components + Product Management UI
Build the reusable `DataTable`, `FormField`, and `ConfirmDialog` components here (Products is the first module, so it's where these generic building blocks get created), then the Product list/add/edit/delete screens using them. Every later frontend phase reuses these components as-is.

### Phase F2 — Customer & Supplier Management UI
A single generic `PartyListPage`/`PartyFormDialog` pair (parameterized by "customer" vs "supplier"), reusing `DataTable`/`FormField`/`ConfirmDialog` from F1 — not two separate near-identical screens.

### Phase F3 — Sales Order Module UI
The Sales Order form and status-tracking UI. Also where the reusable `OrderLineItemsEditor` (add/remove product+quantity rows) and `StatusChip` components are built, since Sales Orders are the first status-workflow module on the frontend.

### Phase F4 — Purchase Order Module UI
Purchase Order form and status UI, explicitly reusing `OrderLineItemsEditor` and `StatusChip` from F3 (parameterized via props) rather than rebuilding them.

### Phase F5 — GRN Module UI
GRN list and form screens, reusing `OrderLineItemsEditor` (pre-populated from a selected Purchase Order) and `DataTable`.

### Phase F6 — Invoice Module UI
Invoice list screen (reusing `DataTable`/`StatusChip`), "generate from approved sales order" action, and PDF download/view.

### Phase F7 — Dashboard & Reporting UI
The `SummaryChart` reusable Recharts wrapper, the role-aware Dashboard page (widgets shown/hidden via `RoleGate`), and the Reports page with date-filterable charts/tables.

### Phase F8 — Frontend Testing & Final Hardening
Jest + React Testing Library tests for `AuthContext`/`ProtectedRoute`/`RoleGate`, `DataTable`, `FormField`, and at least one representative list page and form page. Manual role-based UI testing checklist: log in as each of the 5 roles and confirm Sidebar/page access matches the role matrix exactly. Final duplication audit across the whole frontend against `rules.md`.

---

## PART C — OPTIONAL

### Phase X — Stretch Enhancements
Pick any of: email notifications, QR code on invoices, richer role-based dashboard graphs, Excel/CSV export, mobile-responsive polish. Only after Phase F8 is fully green, and each enhancement must slot into existing shared components rather than introducing parallel utilities.

---

## How to Use This File
1. Read the phase description here to know the goal and scope.
2. Open `prompts.md`, copy the matching phase's prompt (once it's been regenerated to match this backend-first/frontend-second order).
3. Paste it into your AI coding assistant along with `architecture.md` and `rules.md`.
4. Build, test, and manually verify before moving to the next phase.
5. Don't start any frontend phase (Part B) until every backend phase (Part A) is complete, tested, and confirmed working via Swagger/Postman.
