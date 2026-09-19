import "@testing-library/jest-dom/vitest";

// jsdom lacks URL.createObjectURL (used by the invoice PDF download).
if (typeof window.URL.createObjectURL === "undefined") {
  window.URL.createObjectURL = () => "blob:mock";
  window.URL.revokeObjectURL = () => {};
}
