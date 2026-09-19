import { useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { NAV_ITEMS } from "./navItems";
import { useAuth } from "../../auth/AuthContext";

const DRAWER_WIDTH = 240;

/**
 * Role-aware sidebar. Renders NAV_ITEMS filtered by:
 *  1. role: item.roles.includes(user's role)
 *  2. enabled: only modules with shipped UI (F1+ flips their flag on)
 */
export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();
  const [mobileOpen] = useState(false);

  const items = NAV_ITEMS.filter(
    (item) => item.enabled && (!role || item.roles.includes(role))
  );

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {items.map(({ label, path, icon: Icon }) => (
          <ListItemButton
            key={path}
            component={RouterNavLink}
            to={path}
            onClick={onClose}
            sx={{
              "&.active": {
                bgcolor: "action.selected",
                borderRight: 3,
                borderColor: "primary.main",
              },
            }}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ variant: "body2" }} />
          </ListItemButton>
        ))}
        {items.length === 0 && (
          <ListItemButton disabled>
            <ListItemText
              primary="No modules available yet"
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </ListItemButton>
        )}
      </List>
    </>
  );

  return (
    <>
      {/* Persistent drawer on md+ */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Temporary drawer on small screens (opened by Topbar menu button) */}
      <Drawer
        variant="temporary"
        open={open ?? mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
