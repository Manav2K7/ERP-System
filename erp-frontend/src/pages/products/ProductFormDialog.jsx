import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import FormField from "../../components/common/FormField";

const productSchema = Yup.object({
  name: Yup.string().required("Product name is required").max(100, "Max 100 characters"),
  sku: Yup.string().required("SKU is required").max(50, "Max 50 characters"),
  category: Yup.string().max(100, "Max 100 characters"),
  unitPrice: Yup.number()
    .typeError("Unit price must be a number")
    .required("Unit price is required")
    .moreThan(0, "Unit price must be greater than 0"),
  currentStock: Yup.number()
    .typeError("Current stock must be a number")
    .required("Current stock is required")
    .min(0, "Cannot be negative")
    .integer("Must be a whole number"),
  reorderLevel: Yup.number()
    .typeError("Reorder level must be a number")
    .required("Reorder level is required")
    .min(0, "Cannot be negative")
    .integer("Must be a whole number"),
});

/**
 * Product add/edit dialog — the first consumer of FormField (F1 pattern for
 * every later form dialog: parent controls `open`, hands in onSubmit, dialog
 * re-seeds its defaults from the `product` prop on open).
 */
export default function ProductFormDialog({ open, product, onClose, onSubmit }) {
  const isEdit = Boolean(product);
  const [serverError, setServerError] = useState(null);

  const methods = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      unitPrice: undefined,
      currentStock: undefined,
      reorderLevel: undefined,
    },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Re-seed the form whenever the dialog opens for a different product.
  const seed = open ? product ?? "new" : null;
  const [lastSeed, setLastSeed] = useState(null);
  if (open && seed !== lastSeed) {
    setLastSeed(seed);
    reset(
      isEdit
        ? {
            name: product.name,
            sku: product.sku,
            category: product.category || "",
            unitPrice: product.unitPrice,
            currentStock: product.currentStock,
            reorderLevel: product.reorderLevel,
          }
        : {
            name: "",
            sku: "",
            category: "",
            unitPrice: undefined,
            currentStock: undefined,
            reorderLevel: undefined,
          }
    );
    setServerError(null);
  }

  const submit = async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (err) {
      if (err.fieldErrors?.length) {
        setServerError(err.fieldErrors.map((f) => f.message).join(" · "));
      } else {
        setServerError(err.message || "Save failed");
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit product" : "Add product"}</DialogTitle>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
          <DialogContent>
            <Stack spacing={2}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              <FormField name="name" label="Product name" control={methods.control} required />
              <FormField name="sku" label="SKU" control={methods.control} required />
              <FormField name="category" label="Category" control={methods.control} />
              <FormField name="unitPrice" label="Unit price (₹)" control={methods.control} type="number" required />
              <FormField name="currentStock" label="Current stock" control={methods.control} type="number" required />
              <FormField name="reorderLevel" label="Reorder level" control={methods.control} type="number" required />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
