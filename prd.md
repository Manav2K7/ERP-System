# PRD — ERP System for Inventory and Sales Management

## 1. What to Build
A full-stack ERP web application for a mid-sized distribution/trading company, consisting of:
- **Backend**: Java Spring Boot REST API with JWT auth, role-based access, MySQL/PostgreSQL persistence, Swagger docs
- **Frontend**: React.js SPA with role-based navigation, forms, tables, dashboards with charts

The system digitizes: product/inventory management, customer & supplier management, sales orders, purchase orders, GRN (Goods Receipt Notes) that update stock, invoice generation (with PDF), and financial/operational dashboards.

## 2. Targeted Users (Roles)

| Role | Access Rights |
|---|---|
| **Admin** | Full access to all modules and reports |
| **Sales Executive** | Manage customers, create sales orders and invoices |
| **Purchase Manager** | Manage suppliers, purchase orders, GRNs |
| **Inventory Manager** | View stock, update quantities via GRN |
| **Accountant** | Manage invoices, view financial reports |

Navigation and available screens/modules must adapt based on the logged-in user's role (both frontend sidebar visibility and backend endpoint authorization).

## 3. Core Features / Modules

### 3.1 Authentication & Authorization
- Login / Register
- JWT-secured API access
- Role-based access control (5 roles above) enforced on both backend and frontend

### 3.2 Product Management
- CRUD: `GET/POST/PUT/DELETE /api/products`
- Fields: Product Name, SKU, Category, Unit Price, Current Stock, Reorder Level
- List/Add/Edit/Delete UI

### 3.3 Customer & Supplier Management
- Customers: `GET/POST /api/customers`
- Suppliers: `GET/POST /api/suppliers`
- Fields (both): Name, Email, Phone, Address, GSTIN (optional)

### 3.4 Sales Order Module
- `GET/POST /api/sales-orders`, `PUT /api/sales-orders/{id}/status`
- Fields: Customer, Products & Quantity, Order Date, Status (Pending, Approved, Dispatched), Total Amount (auto-calculated server-side)
- UI: Sales Order form + status tracking

### 3.5 Purchase Order Module
- `GET/POST /api/purchase-orders`, `PUT /api/purchase-orders/{id}/status`
- Fields: Supplier, Products & Quantity, Expected Delivery Date, Status (Ordered, Received)
- UI: Purchase order form + status update

### 3.6 GRN (Goods Receipt Note)
- `POST /api/grns` (register received goods), `GET /api/grns` (list)
- Logic: submitting a GRN increments stock of received items
- UI: GRN form that updates stock

### 3.7 Invoice Generation
- `GET /api/invoices`, `POST /api/invoices` (auto-generated from an approved sales order), `GET /api/invoices/{id}/pdf`
- Fields: Customer, Linked Sales Order, Tax (GST/VAT), Total Payable, Status (Paid, Unpaid)
- UI: Invoice list + PDF viewer/download

### 3.8 Dashboard & Reporting
- `/api/dashboard/sales-summary`, `/api/dashboard/purchase-summary`, `/api/dashboard/stock-alerts`
- Widgets: Total Sales/Purchases This Month, Top-Selling Products, Low Stock Alerts, Pending Invoices
- Charts via Recharts/Chart.js, with date filters

### 3.9 Frontend Screens
1. Login / Register
2. Dashboard (role-dependent widgets)
3. Products (List/Add/Edit/Delete)
4. Customers / Suppliers
5. Sales Order form & status tracking
6. Purchase Orders & status update
7. GRN form (updates stock)
8. Invoice list & PDF viewer/download
9. Reports (charts + tables with date filters)

## 4. Non-Functional Requirements
- Swagger UI documenting every endpoint (request/response formats, sample tokens, validation rules)
- Postman collection covering all endpoints
- Pagination and filtering on all list endpoints
- Responsive UI (Material UI or Bootstrap)
- Unit tests: JUnit + Mockito (backend), Jest + RTL (frontend)

## 5. Optional / Stretch Enhancements
- Email notifications (order updates, stock alerts)
- QR code on invoices
- Role-based dashboard graphs
- Excel/CSV export
- Mobile-friendly version

## 6. Success Criteria
- All modules functional with correct role-based access
- Stock accurately updated via GRN submissions
- Invoices correctly auto-generated from approved sales orders, with working PDF export
- Dashboard reflects accurate real-time summaries
- Swagger docs complete; Postman collection runnable end-to-end
- Core backend services and frontend components covered by tests
