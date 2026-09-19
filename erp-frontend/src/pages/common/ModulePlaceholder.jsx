/**
 * ONE shared page placeholder used for every module route stubbed in F0.
 * F1–F7 replace these by pointing the same routes at real pages.
 */

import { Box, Paper, Stack, Typography } from "@mui/material";

export default function ModulePlaceholder({ title }) {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            This module is planned for a later frontend phase — the route and
            sidebar entry are already wired. Sidebar items stay hidden until
            their phase lands, so users only ever see working screens.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
