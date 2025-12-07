import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User, CreateUserRequest, UpdateUserRequest } from "../../models/user";
import * as userApi from "../../api/user";
import { AxiosError } from "axios";

interface UserState {
  users: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  users: [],
  status: "idle",
  error: null,
};

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return String(error);
};

// Thunks
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await userApi.getUsers(token);
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async ({ data, token }: { data: CreateUserRequest; token: string }, { rejectWithValue }) => {
    try {
      const res = await userApi.createUser(data, token);
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (
    { userId, data, token }: { userId: string; data: UpdateUserRequest; token: string },
    { rejectWithValue }
  ) => {
    try {
      await userApi.updateUser(userId, data, token);
      return { userId, data };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async ({ userId, token }: { userId: string; token: string }, { rejectWithValue }) => {
    try {
      await userApi.deleteUser(userId, token);
      return userId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.users = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.userId);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload.data };
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
