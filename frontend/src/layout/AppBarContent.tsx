import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { ListItemIcon } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useLocation, useNavigate } from 'react-router-dom';
import type { User } from '../models/auth';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { logout as logoutThunk } from "../store/slices/authSlice";

import SearchBox from "../components/common/SearchBox";
import NotificationIcon from "../components/common/NotificationIcon";

interface AppBarContentProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
}

export default function AppBarContent({
  drawerOpen,
  toggleDrawer,
}: AppBarContentProps) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = (location.state as { user?: User })?.user;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* LEFT SECTION */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={toggleDrawer} edge="start">
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <img
              src="/assets/wvis.png"
              alt="Logo"
              style={{ width: 50, height: 50 }}
            />
            <Typography
              variant="h4"
              noWrap
              sx={{ ml: 1, color: theme.palette.text.primary }}
            >
              Candidate Management
            </Typography>
          </Box>
        </Box>

        {/* RIGHT SECTION */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			{/* Search */}
			<SearchBox />


			{/* Notifications */}
			<NotificationIcon />


          {/* Profile */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={handleMenuOpen}
          >
            <Avatar
              src="https://avatars.githubusercontent.com/u/19550456"
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Box sx={{ 
				textAlign: 'left', 
				// display: drawerOpen ? 'block' : 'none' 
				}}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
          </Box>

          {/* Dropdown menu */}
			<Menu
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={handleMenuClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			PaperProps={{
				sx: {
				width: 200,
				maxWidth: '100%',
				p: 1,
				borderRadius: 2,
				boxShadow: theme.shadows[3],
				},
			}}
			>
			<Box sx={{ textAlign: 'center', mb: 1 }}>
				<Avatar
				src="https://avatars.githubusercontent.com/u/19550456"
				sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}
				/>
				<Typography variant="body1" fontWeight={600}>
				{user?.username}
				</Typography>
				<Typography variant="caption" color="text.secondary">
				{user?.role}
				</Typography>
			</Box>

			<Divider sx={{ my: 1 }} />

			<MenuItem disableRipple sx={{ justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<LanguageIcon sx={{ mr: 1 }} />
				<Typography variant="body2">Language</Typography>
				</Box>
				<Typography variant="body2" color="text.secondary">
				Eng
				</Typography>
			</MenuItem>

			<MenuItem disableRipple onClick={handleMenuClose}>
				<ListItemIcon>
				<SettingsOutlinedIcon fontSize="small" />
				</ListItemIcon>
				<Typography variant="body2">Settings</Typography>
			</MenuItem>

			<Divider sx={{ my: 1 }} />

			<MenuItem
				onClick={handleLogout}
				sx={{
				justifyContent: 'center',
				bgcolor: theme.palette.action.hover,
				borderRadius: 1,
				fontWeight: 600,
				color: theme.palette.error.main,
				'&:hover': {
					bgcolor: theme.palette.action.selected,
				},
				}}
			>
				<LogoutOutlinedIcon sx={{ mr: 1 }} fontSize="small" />
				Logout
			</MenuItem>
			</Menu>


        </Box>
      </Toolbar>
    </AppBar>
  );
}
