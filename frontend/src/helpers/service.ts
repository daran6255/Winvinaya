import axios, { AxiosError } from "axios";
import {
  LoginResponse,
  SignupData,
  SignupResponse,
  LogoutResponse,
  VerifyTokenResponse,
} from "./model";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;


// Axios instance with defaults
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // To send cookies if any
});

// Central error handler - throws structured error for UI handling
const handleError = (error: AxiosError): never => {
  if (error.response) {
    console.error("API Error:", error.response.data);
    if (error.response.status === 404) {
      alert("Resource not found: " + JSON.stringify(error.response.data));
    }
    // Throw the response data as error for UI to consume
    throw error.response.data || { message: "An unexpected error occurred" };
  } else if (error.request) {
    console.error("No response received:", error.request);
    throw { message: "No response received from the server" };
  } else {
    console.error("Request setup error:", error.message);
    throw { message: "An error occurred while setting up the request" };
  }
};

// =======================
// Auth API Services
// =======================

/**
 * Login user and get token and user info.
 * @param email
 * @param password
 * @returns LoginResponse
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    if (response.data.status === "success" && response.data.token) {
      localStorage.setItem("access_token", response.data.token);
    }
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

/**
 * Signup new user.
 * @param userData Signup data
 * @returns SignupResponse
 */
export const signup = async (data: SignupData): Promise<SignupResponse> => {
  try {
    const response = await axiosInstance.post<SignupResponse>("/oauth/signup", data);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};


/**
 * Logout user and invalidate token.
 * @returns LogoutResponse
 */
export const logout = async (): Promise<LogoutResponse> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axiosInstance.post<LogoutResponse>(
      "/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    localStorage.removeItem("access_token");
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};


/**
 * Verify token validity and get user info.
 * @returns VerifyTokenResponse
 */
export const verifyToken = async (): Promise<VerifyTokenResponse> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Consistent error format expected by handleError
      throw { message: "No token found", status: 401 };
    }

    const response = await axiosInstance.get<VerifyTokenResponse>(
      "/auth/verify-token",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Token verification error:", error);
    return handleError(error as AxiosError);
  }
};
