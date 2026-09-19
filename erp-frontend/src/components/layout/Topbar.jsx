import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../auth/AuthContext";
import { DRAWER_WIDTH } from "./Sidebar";

/**
 * Top app bar: menu toggle (mobile), app title, current user identity, logout.
 * Logout clears auth state (AuthContext) and routes to /login via AppRoutes' guard.
 */
export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          ERP System
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {user && (
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" noWrap>
                {user.fullName || user.email}
              </Typography>
              <Typography variant="caption" noWrap sx={{ opacity: 0.8 }}>
                {user.role}
              </Typography>
            </Box>
          )}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            data-testid="logout-button"
          >
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
