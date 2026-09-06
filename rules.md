# Rules — ERP System for Inventory and Sales Management

Guardrails for anyone (human or AI) writing code for this project. Keep this open alongside `architecture.md` and the relevant phase prompt from `prompts.md`.

## 0. The One Rule Above All Others
**Less code, more productivity. Reuse relentlessly.** Before creating any new file, check whether an existing component/class/util already does 90% of the job and can be extended or parameterized instead. Two modules that look similar (Customers/Suppliers, Sales Orders/Purchase Orders, any list screen, any form) must share the same underlying building blocks — not near-duplicate files with different names.

## 1. What to Use

### Backend
- Java 17+, Spring Boot 3.x, Maven
- Spring Data JPA + MySQL (or PostgreSQL — pick one at Phase 0 and never mix)
- Spring Security 6 with stateless JWT (same pattern for every protected endpoint)
- Bean Validation on every request DTO
- `springdoc-openapi` for Swagger
- Lombok for boilerplate
- BCryptPasswordEncoder for passwords
- DTOs for every request/response — **never expose entities in controllers**
- One `GlobalExceptionHandler` for the whole app, not one per module
- One generic `PagedResponse<T>` for every paginated list endpoint (Products, Customers, Suppliers, Sales Orders, Purchase Orders, GRNs, Invoices — all reuse the same class)
- One shared PDF utility (`PdfGenerator`) even if only Invoices use it today
- Pagination via Spring Data `Pageable` on every list endpoint
- Constructor injection everywhere

### Frontend
- React 18+, functional components + hooks only (no class components)
- One shared `axiosClient.js` with a request interceptor (attach JWT) and response interceptor (redirect to login on 401) — every API module (`productApi.js`, etc.) imports this same client, none creates its own Axios instance
- One shared `DataTable` component for every list screen (Products, Customers, Suppliers, Sales Orders, Purchase Orders, GRNs, Invoices)
- One shared `FormField` wrapper for React Hook Form + MUI inputs, reused across every form
- One shared `AuthContext` for user/role/token state — no duplicate auth state elsewhere
- One `ProtectedRoute`/`RoleGate` pattern for all route and UI-element gating — don't hand-roll role checks per page
- Yup schemas colocated with their form, but shared field-level validators (e.g. email, phone, GSTIN pattern) extracted to a single `validators.js` if used in more than one form
- Customer and Supplier screens: **one generic component pair**, parameterized, not two near-identical modules

### Testing
- JUnit 5 + Mockito for backend service/controller tests
- Jest + React Testing Library for frontend component tests
- Postman collection covering every endpoint

## 2. What to Avoid

- ❌ Don't create a new DTO/response/pagination class per module when the existing generic one fits — extend generics, don't duplicate shapes
- ❌ Don't put business logic in controllers — controllers only translate request → service call → response
- ❌ Don't return JPA entities directly from any controller
- ❌ Don't hardcode secrets (JWT secret, DB password, any API key) — always via environment variables
- ❌ Don't use field-level `@Autowired` — constructor injection only
- ❌ Don't trust client-supplied totals, prices, or tax amounts — Sales Order total and Invoice totalPayable are always recalculated server-side from current product prices and quantities
- ❌ Don't let GRN submission silently fail to update stock — stock update and GRN save must be atomic (`@Transactional`)
- ❌ Don't allow a Purchase/Sales Order status to skip states arbitrarily — define and enforce legal transitions explicitly (e.g. Sales: Pending → Approved → Dispatched only; Purchase: Ordered → Received only)
- ❌ Don't build a second Axios instance, a second table component, a second modal/dialog pattern, or a second form-wrapper component anywhere in the frontend — there is one of each, reused
- ❌ Don't duplicate the Customer module to make the Supplier module (or vice versa) — parameterize one generic "Party" pattern instead, on both backend (if practical) and frontend
- ❌ Don't skip pagination on any list endpoint — GRNs and Invoices grow unbounded over time
- ❌ Don't generate the invoice PDF with ad hoc string concatenation — use the single shared `PdfGenerator` utility so formatting stays consistent across the app
- ❌ Don't write role checks as scattered `if (user.role === 'ADMIN')` throughout components — funnel all of them through `RoleGate`/`ProtectedRoute`/backend `@PreAuthorize`

## 3. AI-Prompting Rules (when generating code phase by phase)
- Always paste `architecture.md` and this `rules.md` alongside the phase prompt from `prompts.md`
- Before generating a new module (e.g. Purchase Orders after Sales Orders is done), explicitly ask the AI to reuse the existing generic components/classes rather than regenerate parallel ones — the phase prompts already say this, but restate it if the AI drifts
- Review every diff for accidental duplication (a second `PagedResponse`, a second Axios client, a second table component) before merging
- Don't move to the next phase until the current one builds/tests clean AND you've spot-checked for duplicate utility code
