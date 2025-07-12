import React, { useState } from 'react';
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
import { signup } from '../helpers/service';
import { SignupData } from '../helpers/model';
import useCustomToast from '../hooks/useCustomToast';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const showToast = useCustomToast();
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await signup(formData);
      if (response.status === 'success') {
        showToast('Signup Successful', response.result, 'success');
        setFormData({ name: '', email: '', password: '' });
      } else {
        showToast('Signup Failed', typeof response.result === 'string' ? response.result : 'Signup failed', 'error');
      }
    } catch (error: unknown) {
      const err = error as Error;
      showToast('Signup Error', err.message || 'An unknown error occurred.', 'error');
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
      bg={useColorModeValue('white', 'gray.800')}
    >
      <Heading as="h2" size="xl" textAlign="center" mb={6} color={theme.colors.ui.main}>
        Create an Account
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              focusBorderColor={theme.colors.ui.accent}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
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
            loadingText="Signing up..."
            borderRadius="xl"
          >
            Sign Up
          </Button>
        </VStack>
      </form>

      <Text mt={6} textAlign="center" color="gray.600">
        Already have an account?{' '}
        <Link href="/login" color={theme.colors.ui.secondary} fontWeight="medium">
          Log in
        </Link>
      </Text>
    </Box>
  );
};

export default Signup;
