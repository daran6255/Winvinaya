import axios from "axios";
import type { LoginRequest, LoginResponse, LogoutResponse, VerifyTokenResponse } from "../models/auth";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth`;

export const login = async (data: LoginRequest) => {
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, data);
  return response.data;
};

export const logout = async (token: string) => {
  const response = await axios.post<LogoutResponse>(
    `${API_URL}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const verifyToken = async (token: string) => {
  const response = await axios.get<VerifyTokenResponse>(`${API_URL}/verify-token`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
