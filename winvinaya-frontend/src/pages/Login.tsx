'use client';

import { useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  Stack,
  useTheme,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '../models/auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/slices/authSlice';

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { status, error, user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginRequest) => {
    dispatch(login(data));
  };

  // Navigate on successful login
  useEffect(() => {
    if (status === 'succeeded' && user) {
      navigate('/dashboard', { state: { user } });
    }
  }, [status, user, navigate]);

  return (
    <Grid
      container
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Grid item xs={11} sm={8} md={4}>
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: theme.customShadows.section,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={2}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter your email and password to access your account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <TextField
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format',
                  },
                })}
                label="Email Address"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 5,
                    message: 'Minimum 6 characters',
                  },
                })}
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Remember me
                    </Typography>
                  }
                />
                <Link href="#" variant="body2" underline="hover">
                  Forgot password?
                </Link>
              </Stack>

              <Button
                type="submit"
                color="primary"
                variant="contained"
                size="large"
                disabled={status === 'loading'}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: theme.customShadows.button,
                }}
              >
                {status === 'loading' ? (
                  <CircularProgress color="secondary" size={24} />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </form>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            © 2024 SaasAble ·{' '}
            <Link href="#" underline="hover">
              Privacy Policy
            </Link>{' '}
            ·{' '}
            <Link href="#" underline="hover">
              Terms & Conditions
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
