import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuth } from "../../auth/AuthContext";

const loginSchema = Yup.object({
  email: Yup.string().required("Email is required").email("Enter a valid email"),
  password: Yup.string().required("Password is required"),
});

/**
 * Login page. On success: honor ?next= (set by ProtectedRoute when bouncing an
 * unauthenticated visit), otherwise go to "/".
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await login(values);
      const next = searchParams.get("next");
      navigate(next ? decodeURIComponent(next) : "/", { replace: true });
    } catch (err) {
      setServerError(err.message || "Login failed. Check your credentials.");
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
      <Paper sx={{ width: "100%", maxWidth: 420, p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Sign in
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
            data-testid="login-form"
          >
            <Stack spacing={2}>
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
                autoComplete="current-password"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register("password")}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                data-testid="login-submit"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center">
            Don&apos;t have an account?{" "}
            <Link component={RouterLink} to="/register">
              Register
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
