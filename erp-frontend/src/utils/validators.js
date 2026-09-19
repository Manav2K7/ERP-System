import * as Yup from "yup";

/**
 * Shared field-level validators (rules.md §1: extracted here because more than
 * one form uses them — Party forms in F2, order/GRN forms later).
 */
export const emailValidator = Yup.string()
  .required("Email is required")
  .email("Enter a valid email")
  .max(100, "Max 100 characters");

export const phoneValidator = Yup.string()
  .nullable()
  .notRequired()
  .test("phone", "Enter a valid phone number", (v) => {
    if (v === undefined || v === null || v === "") return true;
    return /^[0-9+\-\s()]{7,20}$/.test(v);
  });

export const gstinValidator = Yup.string()
  .nullable()
  .notRequired()
  .test("gstin", "GSTIN must be 15 characters", (v) => {
    if (v === undefined || v === null || v === "") return true;
    return /^[0-9A-Z]{15}$/.test(v);
  });
