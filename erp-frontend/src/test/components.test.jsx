import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider } from "react-hook-form";
import DataTable from "../components/common/DataTable";
import FormField from "../components/common/FormField";
import ConfirmDialog from "../components/common/ConfirmDialog";
import StatusChip from "../components/common/StatusChip";

const COLUMNS = [
  { id: "name", label: "Name" },
  { id: "unitPrice", label: "Price", align: "right", render: (r) => `₹${r.unitPrice}` },
];

describe("DataTable", () => {
  const baseProps = {
    columns: COLUMNS,
    totalElements: 2,
    page: 0,
    rowsPerPage: 10,
    onPageChange: vi.fn(),
    onRowsPerPageChange: vi.fn(),
  };

  it("renders column headers and formatted cell values", () => {
    render(
      <DataTable {...baseProps} rows={[{ id: 1, name: "Widget", unitPrice: 5 }, { id: 2, name: "Bolt", unitPrice: 1 }]} />
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("₹5")).toBeInTheDocument();
    expect(screen.getByText("Bolt")).toBeInTheDocument();
  });

  it("shows the empty message when there are no rows", () => {
    render(<DataTable {...baseProps} rows={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("invokes onPageChange when the user goes to the next page", async () => {
    const onPageChange = vi.fn();
    // 25 items at 10/page → next page genuinely exists, so the button is enabled.
    render(
      <DataTable
        {...baseProps}
        totalElements={25}
        rows={Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}`, unitPrice: 1 }))}
        onPageChange={onPageChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalled();
  });

  it("keeps the next-page button inert when there is no next page", async () => {
    const onPageChange = vi.fn();
    // 2 items at 10/page → no page 2; MUI disables the control (pointer-events: none).
    render(<DataTable {...baseProps} rows={[{ id: 1, name: "Widget", unitPrice: 5 }]} onPageChange={onPageChange} />);
    const nextButton = screen.getByRole("button", { name: /next page/i });
    expect(nextButton).toBeDisabled();
    await userEvent.click(nextButton, { pointerEventsCheck: 0 });
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("renders row actions injected via __actions", () => {
    render(
      <DataTable
        {...baseProps}
        rows={[{ id: 1, name: "Widget", unitPrice: 5, __actions: <button>edit row</button> }]}
      />
    );
    expect(screen.getByText("edit row")).toBeInTheDocument();
  });
});

function FieldHarness({ defaultValues }) {
  const { control, handleSubmit } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit((v) => window.__formValues = v)}>
      <FormField name="email" label="Email" control={control} />
      <FormField name="qty" label="Quantity" control={control} type="number" />
      <button type="submit">submit</button>
    </form>
  );
}

describe("FormField", () => {
  it("collects text and number values through RHF", async () => {
    render(<FieldHarness defaultValues={{ email: "", qty: undefined }} />);
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: "4" } });
    fireEvent.click(screen.getByText("submit"));
    await waitFor(() =>
      expect(window.__formValues).toEqual({ email: "a@b.com", qty: 4 })
    );
  });
});

describe("ConfirmDialog", () => {
  it("calls onConfirm and onCancel", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(
      <ConfirmDialog open title="Delete?" message="Sure?" onConfirm={onConfirm} onCancel={onCancel} />
    );
    await userEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    rerender(<ConfirmDialog open title="Delete?" message="Sure?" onConfirm={onConfirm} onCancel={onCancel} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows the error message inside the dialog", () => {
    render(
      <ConfirmDialog open title="Delete?" message="Sure?" errorMessage="Delete failed" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText("Delete failed")).toBeInTheDocument();
  });
});

describe("StatusChip", () => {
  it("maps statuses to humanized labels", () => {
    render(<StatusChip status="PARTIALLY_RECEIVED" />);
    expect(screen.getByText("Partially Received")).toBeInTheDocument();
    expect(screen.getByText("Partially Received").closest(".MuiChip-root")).toHaveClass("MuiChip-colorWarning");
  });
});
