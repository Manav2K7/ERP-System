import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import RoleGate from "../auth/RoleGate";
import authApi from "../api/authApi";

vi.mock("../api/authApi", () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    changePassword: vi.fn(),
  },
}));

function Probe() {
  const { user, role, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-state">
        {isAuthenticated ? `in:${role}` : "out"}
      </div>
      <div data-testid="user-name">{user?.fullName ?? "none"}</div>
      <button onClick={() => login({ email: "a@b.com", password: "secret123" })}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("AuthContext", () => {
  it("starts unauthenticated", () => {
    renderWithProviders(<Probe />);
    expect(screen.getByTestId("auth-state")).toHaveTextContent("out");
  });

  it("login() stores token+user and exposes the canonical role", async () => {
    authApi.login.mockResolvedValue({
      token: "jwt-123",
      user: { email: "a@b.com", fullName: "Alice", role: "ADMIN" },
    });
    renderWithProviders(<Probe />);
    await userEvent.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("in:ADMIN"));
    expect(localStorage.getItem("erp.token")).toBe("jwt-123");
    expect(JSON.parse(localStorage.getItem("erp.user")).role).toBe("ADMIN");
  });

  it("logout() clears state and storage", async () => {
    localStorage.setItem("erp.token", "jwt-123");
    localStorage.setItem(
      "erp.user",
      JSON.stringify({ email: "a@b.com", fullName: "Alice", role: "ADMIN" })
    );
    renderWithProviders(<Probe />);
    expect(screen.getByTestId("auth-state")).toHaveTextContent("in:ADMIN");
    await userEvent.click(screen.getByText("logout"));
    expect(screen.getByTestId("auth-state")).toHaveTextContent("out");
    expect(localStorage.getItem("erp.token")).toBeNull();
  });
});

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /login preserving the attempted URL", () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <div>secret page</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>,
      { route: "/products" }
    );
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    localStorage.setItem("erp.token", "jwt-123");
    localStorage.setItem(
      "erp.user",
      JSON.stringify({ email: "a@b.com", fullName: "Alice", role: "ADMIN" })
    );
    renderWithProviders(
      <ProtectedRoute>
        <div>secret page</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("secret page")).toBeInTheDocument();
  });

  it("bounces a wrong role away from a role-restricted route", () => {
    localStorage.setItem("erp.token", "jwt-123");
    localStorage.setItem(
      "erp.user",
      JSON.stringify({ email: "s@b.com", fullName: "Sales", role: "SALES_EXECUTIVE" })
    );
    renderWithProviders(
      <Routes>
        <Route
          path="/admin-only"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <div>admin page</div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<div>home</div>} />
      </Routes>,
      { route: "/admin-only" }
    );
    expect(screen.queryByText("admin page")).not.toBeInTheDocument();
    expect(screen.getByText("home")).toBeInTheDocument();
  });
});

describe("RoleGate", () => {
  it("renders children for an allowed role and fallback otherwise", () => {
    localStorage.setItem("erp.token", "jwt-123");
    localStorage.setItem(
      "erp.user",
      JSON.stringify({ email: "s@b.com", fullName: "Sales", role: "SALES_EXECUTIVE" })
    );
    renderWithProviders(
      <>
        <RoleGate roles={["SALES_EXECUTIVE"]}>
          <button>allowed action</button>
        </RoleGate>
        <RoleGate roles={["ADMIN"]}>
          <button>admin action</button>
        </RoleGate>
        <RoleGate roles={["ADMIN"]} fallback={<div>no access</div>}>
          <button>never</button>
        </RoleGate>
      </>
    );
    expect(screen.getByText("allowed action")).toBeInTheDocument();
    expect(screen.queryByText("admin action")).not.toBeInTheDocument();
    expect(screen.getByText("no access")).toBeInTheDocument();
  });
});
