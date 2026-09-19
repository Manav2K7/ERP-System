import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_LIST } from "../../auth/roles";

const ROLE_LABELS = {
  ADMIN: "Admin",
  SALES_EXECUTIVE: "Sales Executive",
  PURCHASE_MANAGER: "Purchase Manager",
  INVENTORY_MANAGER: "Inventory Manager",
  ACCOUNTANT: "Accountant",
};

const registerSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().required("Email is required").email("Enter a valid email"),
  password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  role: Yup.string().oneOf(ROLE_LIST, "Select a role").required("Role is required"),
});

/**
 * Registration page. The backend register endpoint issues a token on success,
 * so the user lands in the app immediately (same flow as login).
 * NOTE: registration picks a role freely because the endpoint is public —
 * fine for this internal ERP; tighten with an invite/admin flow later if needed.
 */
export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", role: "" },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await registerUser(values);
      navigate("/", { replace: true });
    } catch (err) {
      // axiosClient normalizes fieldErrors from the backend's ErrorResponse.
      if (err.status === 409) {
        setServerError("An account with this email already exists.");
      } else if (err.fieldErrors?.length) {
        setServerError(err.fieldErrors.map((f) => f.message).join(" · "));
      } else {
        setServerError(err.message || "Registration failed.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 460, p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ERP System — Inventory &amp; Sales Management
            </Typography>
          </Box>

          {serverError && <Alert severity="error">{serverError}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            data-testid="register-form"
          >
            <Stack spacing={2}>
              <TextField
                label="Full name"
                fullWidth
                autoComplete="name"
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
                {...register("fullName")}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                autoComplete="email"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register("email")}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                autoComplete="new-password"
                error={Boolean(errors.password)}
                helperText={errors.password?.message || "At least 6 characters"}
                {...register("password")}
              />
              <TextField
                select
                label="Role"
                fullWidth
                defaultValue=""
                error={Boolean(errors.role)}
                helperText={errors.role?.message}
                {...register("role")}
              >
                {ROLE_LIST.map((role) => (
                  <MenuItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                data-testid="register-submit"
              >
                {isSubmitting ? "Creating account…" : "Register"}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center">
            Already have an account?{" "}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
