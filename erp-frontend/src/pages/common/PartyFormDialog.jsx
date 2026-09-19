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
import { emailValidator, phoneValidator, gstinValidator } from "../../utils/validators";

const partySchema = Yup.object({
  name: Yup.string().required("Name is required").max(100, "Max 100 characters"),
  email: emailValidator,
  phone: phoneValidator,
  address: Yup.string().max(255, "Max 255 characters"),
  gstin: gstinValidator,
});

/**
 * THE one generic Party add/edit dialog (F2) — parameterized by `title`,
 * reused for BOTH Customers and Suppliers via PartyListPage. Mirrors the F1
 * ProductFormDialog pattern exactly (FormField + RHF + Yup, seed-on-open).
 */
export default function PartyFormDialog({ open, party, title, onClose, onSubmit }) {
  const isEdit = Boolean(party);
  const [serverError, setServerError] = useState(null);

  const methods = useForm({
    resolver: yupResolver(partySchema),
    defaultValues: { name: "", email: "", phone: "", address: "", gstin: "" },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const seed = open ? party ?? "new" : null;
  const [lastSeed, setLastSeed] = useState(null);
  if (open && seed !== lastSeed) {
    setLastSeed(seed);
    reset(
      isEdit
        ? {
            name: party.name,
            email: party.email,
            phone: party.phone || "",
            address: party.address || "",
            gstin: party.gstin || "",
          }
        : { name: "", email: "", phone: "", address: "", gstin: "" }
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
      <DialogTitle>{isEdit ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
          <DialogContent>
            <Stack spacing={2}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              <FormField name="name" label="Name" control={methods.control} required />
              <FormField name="email" label="Email" control={methods.control} required />
              <FormField name="phone" label="Phone" control={methods.control} />
              <FormField name="address" label="Address" control={methods.control} />
              <FormField name="gstin" label="GSTIN (optional)" control={methods.control} />
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
