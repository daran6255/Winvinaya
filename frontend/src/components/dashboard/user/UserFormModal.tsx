import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createUser, updateUser } from '../../../store/slices/userSlice';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../../models/user';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: User | null;
  isEditMode?: boolean;
}

const roles = ['admin', 'manager', 'sourcing', 'placement', 'data_analyst', 'trainer'];

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  initialData,
  isEditMode = false,
}) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const [form, setForm] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    role_name: '',
  });

  const [showPassword, setShowPassword] = useState(false); // 👈 NEW

  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        setForm({
          username: initialData.username,
          email: initialData.email,
          password: '',
          role_name: initialData.role?.toLowerCase() || '',
        });
      } else {
        setForm({
          username: '',
          email: '',
          password: '',
          role_name: '',
        });
      }
    }
  }, [open, initialData, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email || (!isEditMode && !form.password) || !form.role_name) {
      alert('All fields are required.');
      return;
    }

    if (!token) {
      alert('Token missing. Cannot perform action.');
      return;
    }

    if (isEditMode && initialData) {
      const updateData: UpdateUserRequest = {
        username: form.username,
        email: form.email,
        role_name: form.role_name,
      };

      if (form.password) {
        updateData.password = form.password;
      }

      dispatch(updateUser({ userId: initialData.id, data: updateData, token }));
    } else {
      dispatch(createUser({ data: form, token }));
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent>
        <TextField
          name="username"
          label="Username"
          value={form.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          name="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required={!isEditMode}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          name="role_name"
          label="Role"
          select
          value={form.role_name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          {roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
