# Architecture — ERP System for Inventory and Sales Management

## 1. Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Language / Framework | Java 17+, Spring Boot 3.x |
| Web | Spring Web (REST controllers) |
| Persistence | Spring Data JPA (Hibernate) |
| Database | MySQL 8.x (or PostgreSQL — pick one, stay consistent) |
| Security | Spring Security 6 + JWT (stateless) |
| Validation | Jakarta Bean Validation |
| Docs | springdoc-openapi (Swagger UI) |
| PDF Generation | OpenPDF or iText (for invoice PDF) |
| Testing | JUnit 5, Mockito, Postman |
| Build Tool | Maven |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React.js 18+ (Vite or CRA) |
| Routing | React Router v6 |
| HTTP Client | Axios (with interceptor for JWT header + 401 handling) |
| UI Library | Material UI (MUI) |
| Forms | React Hook Form + Yup |
| Charts | Recharts |
| State | React Context (auth/role) + local component state; React Query optional for server-state caching |
| Testing | Jest + React Testing Library |

> Recommendation: Use **MySQL** and **Material UI** as the defaults unless there's a specific reason to deviate — keeps this document and the phase prompts unambiguous.

## 2. High-Level Request Flow

```
React SPA (Axios, JWT in Authorization header)
        │
        ▼
[Spring Security Filter Chain] JwtAuthenticationFilter
        │  validates token → loads user + role → SecurityContext
        ▼
[Controller] (e.g. ProductController) — request/response only, DTOs
        ▼
[Service] (e.g. ProductService) — business logic, role checks, calculations
        ▼
[Repository] (Spring Data JPA) — DB queries
        ▼
[Database] MySQL
        ▼
Response DTO ← Controller ← Service
        ▼
[GlobalExceptionHandler] standardizes any error into ErrorResponse JSON
```

### Sales Order → Invoice Flow
```
Sales Executive creates Sales Order (status=PENDING)
   → Admin/Sales Exec approves → status=APPROVED
   → POST /api/invoices generates Invoice from the approved Sales Order
       (server recalculates total from order lines + tax, never trusts client total)
   → Sales Order may move to DISPATCHED once fulfilled
```

### Purchase Order → GRN → Stock Update Flow
```
Purchase Manager creates Purchase Order (status=ORDERED)
   → Goods physically arrive
   → Inventory/Purchase role submits a GRN referencing the PO + received quantities
   → GRN submission triggers: Product.currentStock += receivedQuantity (per line)
   → Purchase Order status updated to RECEIVED (fully or partially, per your granularity choice)
```

## 3. Backend Folder / File Structure

```
erp-backend/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/erp/
│   │   │   ├── ErpApplication.java
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── SwaggerConfig.java
│   │   │   │
│   │   │   ├── security/
│   │   │   │   ├── JwtUtil.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   │
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── CustomerController.java
│   │   │   │   ├── SupplierController.java
│   │   │   │   ├── SalesOrderController.java
│   │   │   │   ├── PurchaseOrderController.java
│   │   │   │   ├── GrnController.java
│   │   │   │   ├── InvoiceController.java
│   │   │   │   └── DashboardController.java
│   │   │   │
│   │   │   ├── service/ (+ impl/)
│   │   │   │   ├── AuthService(+Impl)
│   │   │   │   ├── ProductService(+Impl)
│   │   │   │   ├── CustomerService(+Impl)
│   │   │   │   ├── SupplierService(+Impl)
│   │   │   │   ├── SalesOrderService(+Impl)
│   │   │   │   ├── PurchaseOrderService(+Impl)
│   │   │   │   ├── GrnService(+Impl)
│   │   │   │   ├── InvoiceService(+Impl)   -- includes PDF generation
│   │   │   │   └── DashboardService(+Impl)
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── CustomerRepository.java
│   │   │   │   ├── SupplierRepository.java
│   │   │   │   ├── SalesOrderRepository.java
│   │   │   │   ├── SalesOrderItemRepository.java
│   │   │   │   ├── PurchaseOrderRepository.java
│   │   │   │   ├── PurchaseOrderItemRepository.java
│   │   │   │   ├── GrnRepository.java
│   │   │   │   ├── GrnItemRepository.java
│   │   │   │   └── InvoiceRepository.java
│   │   │   │
│   │   │   ├── model/ (entities)
│   │   │   │   ├── User.java, Role.java (enum)
│   │   │   │   ├── Product.java
│   │   │   │   ├── Customer.java
│   │   │   │   ├── Supplier.java
│   │   │   │   ├── SalesOrder.java, SalesOrderItem.java, SalesOrderStatus.java (enum)
│   │   │   │   ├── PurchaseOrder.java, PurchaseOrderItem.java, PurchaseOrderStatus.java (enum)
│   │   │   │   ├── Grn.java, GrnItem.java
│   │   │   │   └── Invoice.java, InvoiceStatus.java (enum)
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── request/  (one per entity: e.g. ProductRequest, SalesOrderRequest, SalesOrderItemRequest ...)
│   │   │   │   └── response/ (one per entity + PagedResponse, DashboardSummaryResponse, ErrorResponse)
│   │   │   │
│   │   │   ├── mapper/ (static mapper classes, mirrors dto/entity pairs — reuse pattern, don't duplicate per module)
│   │   │   │
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── DuplicateResourceException.java
│   │   │   │   ├── InsufficientStockException.java
│   │   │   │   └── InvalidStatusTransitionException.java
│   │   │   │
│   │   │   └── util/
│   │   │       └── PdfGenerator.java (shared by InvoiceService only)
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-dev.yml
│   │
│   └── test/java/com/erp/ (mirrors main structure: service/, controller/)
│
└── postman/
    └── ERP_API.postman_collection.json
```

**Reuse principle:** Sales Order and Purchase Order are structurally identical (header + line items + status enum). Purchase-side and Sales-side entities/DTOs/services/controllers are separate classes (different domain meaning, different status values, different roles), but they must reuse the **same patterns**: same PagedResponse, same GlobalExceptionHandler, same BaseAuditFields approach if you introduce one, same mapper style. Do not create parallel utility classes, parallel pagination wrappers, or parallel error DTOs for each module — there is exactly one of each shared building block.

## 4. Frontend Folder / File Structure

```
erp-frontend/
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── api/
│   │   ├── axiosClient.js        -- single Axios instance, JWT interceptor, 401 handler
│   │   ├── authApi.js
│   │   ├── productApi.js
│   │   ├── customerApi.js
│   │   ├── supplierApi.js
│   │   ├── salesOrderApi.js
│   │   ├── purchaseOrderApi.js
│   │   ├── grnApi.js
│   │   ├── invoiceApi.js
│   │   └── dashboardApi.js
│   │
│   ├── auth/
│   │   ├── AuthContext.jsx       -- holds user, role, token; login/logout
│   │   ├── ProtectedRoute.jsx    -- route guard (auth + role check)
│   │   └── RoleGate.jsx          -- conditionally render UI by role
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx       -- role-based nav items
│   │   │   ├── Topbar.jsx
│   │   │   └── AppLayout.jsx
│   │   ├── common/
│   │   │   ├── DataTable.jsx     -- ONE reusable paginated table used by every list screen
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── FormField.jsx     -- ONE reusable RHF-connected input wrapper
│   │   └── charts/
│   │       └── SummaryChart.jsx  -- ONE reusable chart wrapper (Recharts), reused per dashboard widget
│   │
│   ├── pages/
│   │   ├── auth/LoginPage.jsx, RegisterPage.jsx
│   │   ├── dashboard/DashboardPage.jsx
│   │   ├── products/ProductListPage.jsx, ProductFormDialog.jsx
│   │   ├── customers/CustomerListPage.jsx, CustomerFormDialog.jsx
│   │   ├── suppliers/SupplierListPage.jsx, SupplierFormDialog.jsx
│   │   ├── salesOrders/SalesOrderListPage.jsx, SalesOrderFormPage.jsx
│   │   ├── purchaseOrders/PurchaseOrderListPage.jsx, PurchaseOrderFormPage.jsx
│   │   ├── grn/GrnListPage.jsx, GrnFormPage.jsx
│   │   ├── invoices/InvoiceListPage.jsx, InvoiceViewerPage.jsx
│   │   └── reports/ReportsPage.jsx
│   │
│   ├── routes/AppRoutes.jsx
│   ├── theme/muiTheme.js
│   └── utils/formatters.js       -- ONE place for currency/date formatting, reused everywhere
│
└── tests/ (Jest + RTL, mirrors pages/ and components/common/)
```

**Reuse principle:** `DataTable.jsx` is used by Products, Customers, Suppliers, Sales Orders, Purchase Orders, GRNs, and Invoices — one component, configured via props (columns, data, pagination state), not one table component per module. Same for `FormField.jsx` and `SummaryChart.jsx`. Customer and Supplier screens should share a single generic `PartyFormDialog.jsx`/`PartyListPage.jsx` pair (parameterized by "customer" vs "supplier") rather than duplicating near-identical CRUD screens twice.

## 5. Core Entity Relationships

```
User (role: ADMIN | SALES_EXECUTIVE | PURCHASE_MANAGER | INVENTORY_MANAGER | ACCOUNTANT)

Product (sku, category, unitPrice, currentStock, reorderLevel)

Customer (name, email, phone, address, gstin?)
Supplier (name, email, phone, address, gstin?)

SalesOrder (customer, orderDate, status, totalAmount)
  └─< SalesOrderItem (product, quantity, unitPriceAtOrder)

PurchaseOrder (supplier, expectedDeliveryDate, status)
  └─< PurchaseOrderItem (product, quantity)

Grn (purchaseOrder, receivedDate)
  └─< GrnItem (product, quantityReceived)
  -- on save: Product.currentStock += quantityReceived for each item

Invoice (customer, salesOrder [1:1 or 1:many depending on design], tax, totalPayable, status)
```

## 6. Security Model
- Stateless JWT auth, same pattern as any prior JWT project: `JwtAuthenticationFilter` + `SecurityConfig`
- Public: `POST /api/auth/register`, `POST /api/auth/login`, Swagger paths
- Role matrix (enforce via `@PreAuthorize`):

| Endpoint group | ADMIN | SALES_EXECUTIVE | PURCHASE_MANAGER | INVENTORY_MANAGER | ACCOUNTANT |
|---|---|---|---|---|---|
| Products (read) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Products (write) | ✅ | ❌ | ❌ | ✅ (stock-related only, or via GRN) | ❌ |
| Customers | ✅ | ✅ | ❌ | ❌ | view-only |
| Suppliers | ✅ | ❌ | ✅ | ❌ | view-only |
| Sales Orders | ✅ | ✅ | ❌ | ❌ | view-only |
| Purchase Orders | ✅ | ❌ | ✅ | ❌ | view-only |
| GRN | ✅ | ❌ | ✅ | ✅ | ❌ |
| Invoices | ✅ | ✅ (create) | ❌ | ❌ | ✅ (manage/status) |
| Dashboard/Reports | ✅ | limited | limited | limited | ✅ |

> Finalize the exact matrix in Phase 1 — the table above is the working default; adjust and lock it before writing `@PreAuthorize` annotations so every phase agrees on the same rules.
