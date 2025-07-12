'use client';

import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../layout/AdminLayout/';
import type { User } from '../models/auth';

export default function Dashboard() {
  const location = useLocation();
  const user = (location.state as { user?: User })?.user;

  return (
    <DashboardLayout>
      <Box p={4}>
        <Typography variant="h4">Welcome to Dashboard!</Typography>
        {user && (
          <Typography variant="body1" mt={2}>
            Logged in as: {user.username} ({user.email})
          </Typography>
        )}
      </Box>
    </DashboardLayout>
  );
}
