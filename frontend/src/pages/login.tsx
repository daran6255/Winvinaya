import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react';
import { login } from '../helpers/service';
import { LoginData, LoginResponse } from '../helpers/model';
import useCustomToast from '../hooks/useCustomToast';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const showToast = useCustomToast();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: LoginResponse = await login(formData.email, formData.password);

    if (response.status === 'success') {
      showToast('Login Successful', 'You have successfully logged in.', 'success');
      localStorage.setItem("user", JSON.stringify(response.result)); // Save user data
      navigate("/dashboard", { state: { user: response.result } }); // Redirect and pass user
    } else {
      showToast(
        'Login Failed',
        typeof response.result === 'string' ? response.result : 'Login failed',
        'error'
      );
    }

    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const message = err.response?.data?.message || err.message || 'An unexpected error occurred during login.';
      showToast('Login Error', message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={12}
      p={8}
      borderRadius="xl"
      boxShadow="lg"
      bg={useColorModeValue('white', 'gray.500')}
    >
      <Heading
        as="h2"
        size="xl"
        textAlign="center"
        mb={6}
        color={theme.colors.ui.main}
      >
        Sign In
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              focusBorderColor={theme.colors.ui.accent}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              focusBorderColor={theme.colors.ui.accent}
            />
          </FormControl>

          <Button
            type="submit"
            variant="primary"
            width="full"
            isLoading={isLoading}
            loadingText="Logging in..."
            borderRadius="xl"
          >
            Log In
          </Button>
        </VStack>
      </form>
      <Text mt={6} textAlign="center" color="gray.600">
        Don’t have an account?{' '}
        <Link href="/signup" color={theme.colors.ui.secondary} fontWeight="medium">
          Sign up
        </Link>
      </Text>
    </Box>
  );
};

export default Login;
