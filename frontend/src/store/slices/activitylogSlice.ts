import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ActivityLog, ActivityLogApiResponse } from "../../models/activity_log";
import { getActivities } from "../../api/activity_log";

interface ActivityLogState {
  logs: ActivityLog[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ActivityLogState = {
  logs: [],
  status: "idle",
  error: null
};

// Async thunk to fetch all activities
export const fetchActivities = createAsyncThunk(
  "activityLog/fetchActivities",
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: { token: string | null } }).auth.token;
    if (!token) {
      return rejectWithValue("No authentication token found");
    }
    try {
      const res: ActivityLogApiResponse = await getActivities(token);
      if (res.status === "success" && res.data) {
        return res.data;
      } else {
        return rejectWithValue(res.message || "Failed to fetch activities");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const activityLogSlice = createSlice({
  name: "activityLog",
  initialState,
  reducers: {
    resetActivityLogState: (state) => {
      state.logs = [];
      state.status = "idle";
      state.error = null;
    },
    addActivityLog: (state, action) => {
      // Add new activity log at the start of the list
      state.logs.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.logs = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  }
});

export const { resetActivityLogState, addActivityLog } = activityLogSlice.actions;
export default activityLogSlice.reducer;
