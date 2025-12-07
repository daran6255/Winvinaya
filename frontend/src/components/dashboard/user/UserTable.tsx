// src/components/dashboard/UserTable.tsx
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  TablePagination,
  TableContainer,
  Paper,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  TextField,
  Stack,
  InputAdornment,
  IconButton as MuiIconButton,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import type { User } from '../../../models/user';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deleteUser, updateUser } from '../../../store/slices/userSlice';

type Props = {
  users: User[];
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rows: number) => void;
};

const roleColors: Record<string, string> = {
  admin: '#4caf50',
  manager: '#2196f3',
  data_analyst: '#9c27b0',
  sourcing: '#ff9800',
  trainer: '#00bcd4',
  placement: '#f44336',
};

const roles = Object.keys(roleColors);

function formatIST(dateString: string) {
  const date = new Date(dateString);
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return istDate.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function UserTable({
  users,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_active: true,
    role_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEls((prev) => ({ ...prev, [userId]: event.currentTarget }));
  };

  const handleMenuClose = (userId: string) => {
    setAnchorEls((prev) => ({ ...prev, [userId]: null }));
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setConfirmOpen(true);
    handleMenuClose(user.id);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      is_active: user.is_active,
      role_name: user.role ?? '',
    });
    setEditDialogOpen(true);
    handleMenuClose(user.id);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser && token) {
      try {
        await dispatch(deleteUser({ userId: selectedUser.id, token })).unwrap();
        setSnackbar({ message: 'User deleted successfully!', severity: 'success' });
      } catch (err) {
        setSnackbar({ message: String(err), severity: 'error' });
      }
      setConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSubmit = async () => {
    if (!selectedUser || !token) return;
    try {
      await dispatch(updateUser({ userId: selectedUser.id, data: formData, token })).unwrap();
      setSnackbar({ message: 'User updated successfully!', severity: 'success' });
      setEditDialogOpen(false);
    } catch (err) {
      setSnackbar({ message: String(err), severity: 'error' });
    }
  };

  return (
    <>
      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                {['Name', 'Email', 'Role', 'Created At', 'Status', 'Actions'].map((head, idx) => (
                  <TableCell key={idx} align={head === 'Actions' ? 'center' : 'left'}>
                    <strong style={{ color: theme.palette.text.secondary }}>{head}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user.id} hover sx={{ height: 48 }}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role?.toUpperCase() || 'UNKNOWN'}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: user.role ? roleColors[user.role] || '#bdbdbd' : '#bdbdbd',
                        color: user.role ? roleColors[user.role] || '#616161' : '#616161',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22,
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        backgroundColor: 'transparent',
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatIST(user.created_at)}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'ACTIVE' : 'INACTIVE'}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: user.is_active ? '#4caf50' : '#9e9e9e',
                        color: user.is_active ? '#4caf50' : '#9e9e9e',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22,
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        backgroundColor: 'transparent',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="More actions">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, user.id)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEls[user.id]}
                      open={Boolean(anchorEls[user.id])}
                      onClose={() => handleMenuClose(user.id)}
                      PaperProps={{ sx: { borderRadius: 2 } }}
                    >
                      <MenuItem onClick={() => handleEditClick(user)}>Edit User</MenuItem>
                      <MenuItem onClick={() => handleDeleteClick(user)}>Delete User</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={users.length}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            onRowsPerPageChange(parseInt(e.target.value, 10));
            onPageChange(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField name="username" label="Username" fullWidth value={formData.username} onChange={handleInputChange} />
            <TextField name="email" label="Email" fullWidth value={formData.email} onChange={handleInputChange} />
            <TextField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MuiIconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </MuiIconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="role_name"
              label="Role"
              select
              fullWidth
              value={formData.role_name}
              onChange={handleInputChange}
            >
          {roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}
