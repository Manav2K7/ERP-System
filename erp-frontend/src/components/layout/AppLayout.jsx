import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";
import Topbar from "./Topbar";

/**
 * The app shell for all authenticated pages: Topbar + role-aware Sidebar +
 * routed content via <Outlet />. The single page-level wrapper reused by
 * every module screen in F1+.
 */
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Topbar onMenuClick={() => setMobileOpen((v) => !v)} />
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar /> {/* spacer under the fixed AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
}
