import axios from "axios";
import type { CreateUserRequest, UserResponse, UserListResponse, UpdateUserRequest, ApiResponse } from "../models/user";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/users`;

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const createUser = async (data: CreateUserRequest, token: string) => {
  const response = await axios.post<UserResponse>(API_URL, data, getAuthHeaders(token));
  return response.data;
};

export const getUsers = async (token: string) => {
  const response = await axios.get<UserListResponse>(API_URL, getAuthHeaders(token));
  return response.data;
};

export const getUserById = async (userId: string, token: string) => {
  const response = await axios.get<UserResponse>(`${API_URL}/${userId}`, getAuthHeaders(token));
  return response.data;
};

export const updateUser = async (userId: string, data: UpdateUserRequest, token: string) => {
  const response = await axios.put<ApiResponse>(`${API_URL}/${userId}`, data, getAuthHeaders(token));
  return response.data;
};

export const deleteUser = async (userId: string, token: string) => {
  const response = await axios.delete<ApiResponse>(`${API_URL}/${userId}`, getAuthHeaders(token));
  return response.data;
};
