import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import ProductListPage from "../pages/products/ProductListPage";
import InvoiceListPage from "../pages/invoices/InvoiceListPage";
import CustomerListPage from "../pages/customers/CustomerListPage";
import productApi from "../api/productApi";
import invoiceApi from "../api/invoiceApi";
import salesOrderApi from "../api/salesOrderApi";
import { createPartyApi } from "../api/partyApi";

vi.mock("../api/productApi", () => ({
  default: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("../api/invoiceApi", () => ({
  default: {
    list: vi.fn(),
    getById: vi.fn(),
    generate: vi.fn(),
    updateStatus: vi.fn(),
    downloadPdf: vi.fn(),
  },
}));

vi.mock("../api/salesOrderApi", () => ({
  default: { list: vi.fn() },
}));

vi.mock("../api/partyApi", () => ({
  createPartyApi: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ProductListPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

const ADMIN = { email: "a@b.com", fullName: "Alice", role: "ADMIN" };
const SALES = { email: "s@b.com", fullName: "Sam", role: "SALES_EXECUTIVE" };

const PRODUCTS = {
  content: [
    {
      id: 1,
      name: "Widget",
      sku: "WGT-1",
      category: "General",
      unitPrice: 99.5,
      currentStock: 3,
      reorderLevel: 5,
      lowStock: true,
      active: true,
    },
  ],
  totalElements: 1,
  totalPages: 1,
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  productApi.list.mockResolvedValue(PRODUCTS);
});

describe("ProductListPage (representative list page)", () => {
  it("loads and renders products from the API", async () => {
    localStorage.setItem("erp.token", "jwt");
    localStorage.setItem("erp.user", JSON.stringify(ADMIN));
    renderPage();
    expect(await screen.findByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("WGT-1")).toBeInTheDocument();
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it("shows write actions for ADMIN and hides them for read-only roles", async () => {
    localStorage.setItem("erp.token", "jwt");
    localStorage.setItem("erp.user", JSON.stringify(SALES));
    renderPage();
    await screen.findByText("Widget");
    expect(screen.queryByText("Add product")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("deletes a product after confirmation", async () => {
    productApi.remove.mockResolvedValue(undefined);
    localStorage.setItem("erp.token", "jwt");
    localStorage.setItem("erp.user", JSON.stringify(ADMIN));
    renderPage();
    await screen.findByText("Widget");
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText(/delete "widget"/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete" })); // dialog confirm
    await waitFor(() => expect(productApi.remove).toHaveBeenCalledWith(1));
  });

  it("opens the add dialog and creates a product through the dialog form", async () => {
    productApi.create.mockResolvedValue({ id: 2 });
    // Second fetch (after create) returns the refreshed list including the new product.
    productApi.list
      .mockResolvedValueOnce(PRODUCTS)
      .mockResolvedValueOnce({
        content: [...PRODUCTS.content, { id: 2, name: "Gadget", sku: "GDG-1", unitPrice: 49.5, currentStock: 10, reorderLevel: 3, active: true }],
        totalElements: 2,
        totalPages: 1,
      });
    localStorage.setItem("erp.token", "jwt");
    localStorage.setItem("erp.user", JSON.stringify(ADMIN));
    renderPage();
    await screen.findByText("Widget");
    await userEvent.click(screen.getByText("Add product"));
    // MUI renders the title text inside the .MuiDialogTitle-root element itself.
    expect(await screen.findByRole("heading", { name: "Add product" })).toHaveClass("MuiDialogTitle-root");

    // Fill the dialog form and submit.
    await userEvent.type(screen.getByLabelText(/product name/i), "Gadget");
    await userEvent.type(screen.getByLabelText(/^sku/i), "GDG-1");
    await userEvent.type(screen.getByLabelText(/unit price/i), "49.5");
    await userEvent.type(screen.getByLabelText(/current stock/i), "10");
    await userEvent.type(screen.getByLabelText(/reorder level/i), "3");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(productApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Gadget", sku: "GDG-1", unitPrice: 49.5 })
    ));
    expect(await screen.findByText("Gadget")).toBeInTheDocument(); // list refreshed
  });
});

describe("InvoiceListPage (smoke/regression)", () => {
  it("renders the list without crashing (guards against missing imports)", async () => {
    localStorage.setItem("erp.token", "jwt");
    localStorage.setItem("erp.user", JSON.stringify(ADMIN));
    invoiceApi.list.mockResolvedValue({
      content: [
        { id: 1, customerName: "Acme", salesOrderId: 5, status: "PENDING", totalPayable: 118, invoiceDate: "2026-09-01T10:00:00" },
      ],
      totalElements: 1,
      totalPages: 1,
    });
    render(
      <MemoryRouter>
        <AuthProvider>
          <InvoiceListPage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("Generate from sales order")).toBeInTheDocument();
  });
});

describe("CustomerListPage (flicker regression)", () => {
  it("fetches exactly once on mount — no re-render fetch loop", async () => {
    const list = vi.fn().mockResolvedValue({ content: [{ id: 1, name: "Acme Corp", active: true }], totalElements: 1, totalPages: 1 });
    createPartyApi.mockReturnValue({ list, create: vi.fn(), update: vi.fn(), remove: vi.fn(), getById: vi.fn() });
    localStorage.setItem("erp.token", "jwt");
    localStorage.setItem("erp.user", JSON.stringify(ADMIN));

    render(
      <MemoryRouter>
        <AuthProvider>
          <CustomerListPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await screen.findByText("Acme Corp");
    // Wait past any re-render cycles — the loop used to re-trigger the fetch here.
    await waitFor(() => expect(list).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 50));
    expect(createPartyApi).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledTimes(1);
  });
});
