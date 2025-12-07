export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  password?: string;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role_name: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  role_name?: string;
}

export interface UserResponse {
  status: string;
  message?: string;
  data: User;
}

export interface UserListResponse {
  status: string;
  data: User[];
}

export interface ApiResponse {
  status: string;
  message: string;
}
