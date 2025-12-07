import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUsers } from '../store/slices/userSlice';
import { createUser } from '../store/slices/userSlice';
import UserTable from '../components/dashboard/user/UserTable';
import UserFormModal from '../components/dashboard/user/UserFormModal';
import type { CreateUserRequest } from '../models/user';

export interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  isEdit: boolean; // <-- Add this
  initialData?: CreateUserRequest; // if you support editing
  onSubmit: (data: CreateUserRequest) => void; // <-- Specify type instead of `any`
}

export default function UserSection() {
  const dispatch = useAppDispatch();
  const { users, status, error } = useAppSelector((state) => state.user);
  const token = useAppSelector((state) => state.auth.token);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchUsers(token));
    }
  }, [dispatch, token]);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        {/* Left side: Title */}
        <Typography variant="h6" fontWeight={600}>
          User Management
        </Typography>

        {/* Right side: Search + Add User */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: '300px' }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
            onClick={() => setOpenModal(true)}
          >
            Add User
          </Button>
        </Stack>
      </Stack>
      
      {status === 'loading' && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {status === 'failed' && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {status === 'succeeded' && (
        <UserTable
          users={filteredUsers}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          setSnackbar={setSnackbar}
        />
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity} variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>

      <UserFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        isEdit={false}
        onSubmit={async (data: CreateUserRequest) => {
          if (token) {
            try {
              await dispatch(createUser({ data, token })).unwrap();
              setSnackbar({ message: 'User created successfully!', severity: 'success' });
              setOpenModal(false);
            } catch (err) {
              setSnackbar({ message: String(err), severity: 'error' });
            }
          }
        }}
      />
    </Box>
  );
}
