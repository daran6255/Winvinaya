import React from 'react';
import { Box, CssBaseline, Toolbar, useTheme } from '@mui/material';
import AppBarContent from './AppBarContent';
import Sidebar from './Sidebar';
import { menuItems } from '../constants/menuItems';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const theme = useTheme();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleExpand = (label: string) => {
    setExpanded(expanded === label ? null : label);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBarContent drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      <Sidebar
        drawerOpen={drawerOpen}
        expanded={expanded}
        handleExpand={handleExpand}
        menuItems={menuItems}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
