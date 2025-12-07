export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  status: "success" | "error";
  message: string;
  data?: {
    user: User;
    access_token: string;
  };
}

export interface LogoutResponse {
  status: "success" | "error";
  message: string;
}

export interface VerifyTokenResponse {
  status: "success" | "error";
  message: string;
  data?: {
    id: string;
    username: string;
    email: string;
  };
}
