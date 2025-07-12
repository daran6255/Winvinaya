import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { LoginRequest, LoginResponse, User } from "../../models/auth";
import { login as loginApi, logout as logoutApi, verifyToken as verifyTokenApi } from "../../api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  status: "idle",
  error: null
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
      const res: LoginResponse = await loginApi(payload);
      if (res.status === "success" && res.data) {
        localStorage.setItem("token", res.data.access_token);
        return res.data;
      } else {
        return rejectWithValue(res.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Login failed");
    }
  }
);


export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    if (token) {
      try {
        await logoutApi(token);
        localStorage.removeItem("token");
      } catch (error: unknown) {
        if (error instanceof Error) {
          return rejectWithValue(error.message);
        }
        return rejectWithValue("Logout failed");
      }
    }
  }
);


export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    if (!token) return rejectWithValue("No token");
    try {
      const res = await verifyTokenApi(token);
      if (res.status === "success" && res.data) {
        return res.data;
      } else {
        return rejectWithValue(res.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Token verification failed");
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
    }
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
      })

      // verifyToken
      .addCase(verifyToken.fulfilled, (state, action) => {
        if (state.user) {
          state.user.username = action.payload.username;
          state.user.email = action.payload.email;
        }
      })
      .addCase(verifyToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      });
  }
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
