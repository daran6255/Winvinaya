import React, { useState } from 'react';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

import { menuItems } from '../constants/menuItems';
import { useSidebar } from '../context/SidebarContext';
import { useBreadcrumbs } from '../context/BreadcrumbContext';

interface SidebarProps {
  drawerOpen: boolean;
  drawerWidth?: number;
}

export default function Sidebar({
  drawerOpen,
  drawerWidth = 260,
}: SidebarProps) {
  const theme = useTheme();
  const { activeSection, setActiveSection } = useSidebar();
  const { setBreadcrumbs } = useBreadcrumbs();

  const [expanded, setExpanded] = useState<string | null>(null);

  const handleExpand = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  const handleClick = (label: string, parentLabel?: string) => {
    setActiveSection(label);
    setBreadcrumbs([
      { label: 'Home' },
      { label: parentLabel || label },
      ...(parentLabel ? [{ label }] : []),
    ]);
  };

  const isActive = (label: string) => label === activeSection;

  const itemTextStyle = {
    color: alpha(theme.palette.text.primary, 0.6),
    fontWeight: 400,
    fontSize: '0.875rem',
  };

  const listItemButtonStyle = (active: boolean) => ({
    px: drawerOpen ? 2 : 1,
    justifyContent: drawerOpen ? 'flex-start' : 'center',
    color: alpha(theme.palette.text.primary, 0.6),
    backgroundColor: active
      ? theme.palette.primary.lighter
      : 'transparent',
    borderRadius: 1,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    transition: theme.transitions.create(['background-color', 'color'], {
      duration: theme.transitions.duration.short,
    }),
  });

  return (
    <Drawer
      variant="permanent"
      open={drawerOpen}
      sx={{
        width: drawerOpen ? drawerWidth : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerOpen ? drawerWidth : 64,
          overflowX: 'hidden',
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Toolbar />
      {menuItems.map((section) => (
        <Box key={section.label}>
          <Typography
            variant="caption"
            sx={{
              pl: 2,
              pt: 2,
              pb: 1,
              display: drawerOpen ? 'block' : 'none',
              color: alpha(theme.palette.text.secondary, 0.6),
              fontWeight: 400,
            }}
          >
            {section.label}
          </Typography>
          <List disablePadding>
            {section.items.map((item) => {
              const active = isActive(item.label);

              return item.children ? (
                <React.Fragment key={item.label}>
                  <ListItemButton
                    onClick={() => handleExpand(item.label)}
                    sx={listItemButtonStyle(expanded === item.label)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        color: theme.palette.text.primary,
                        mr: drawerOpen ? 2 : 0,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {drawerOpen && (
                      <>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ sx: itemTextStyle }}
                        />
                        {expanded === item.label ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </ListItemButton>

                  <Collapse in={expanded === item.label} timeout="auto" unmountOnExit>
                    <List
                      component="div"
                      disablePadding
                      sx={{
                        ml: drawerOpen ? 2 : 0,
                        pl: drawerOpen ? 2 : 0,
                        borderLeft: drawerOpen
                          ? `2px solid ${alpha(theme.palette.divider, 0.3)}`
                          : 'none',
                      }}
                    >
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.label}
                          onClick={() => handleClick(child.label, item.label)}
                          sx={{
                            pl: drawerOpen ? 6 : 2,
                            py: 0.8,
                            ...listItemButtonStyle(isActive(child.label)),
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: drawerOpen ? 2 : 0,
                              color: theme.palette.secondary.main,
                              justifyContent: 'center',
                            }}
                          >
                            {child.icon}
                          </ListItemIcon>
                          {drawerOpen && (
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{ sx: itemTextStyle }}
                            />
                          )}
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <ListItem
                  disablePadding
                  key={item.label}
                  onClick={() => handleClick(item.label)}
                >
                  <ListItemButton sx={listItemButtonStyle(active)}>
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        color: theme.palette.text.primary,
                        mr: drawerOpen ? 2 : 0,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {drawerOpen && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ sx: itemTextStyle }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Divider sx={{ my: 1 }} />
        </Box>
      ))}
    </Drawer>
  );
}
