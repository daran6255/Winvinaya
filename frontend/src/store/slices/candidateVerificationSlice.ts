import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type {
  CandidateProfile,
  CreateCandidateProfileRequest,
  UpdateCandidateProfileRequest,
} from "../../models/candidate_verification";
import * as api from "../../api/candidate_verification";

interface CandidateProfileState {
  profiles: CandidateProfile[];
  selectedProfile: CandidateProfile | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CandidateProfileState = {
  profiles: [],
  selectedProfile: null,
  status: "idle",
  error: null,
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return String(error);
};

export const fetchCandidateProfiles = createAsyncThunk<
  CandidateProfile[],
  string,
  { rejectValue: string }
>("candidateProfiles/fetchAll", async (token, { rejectWithValue }) => {
  try {
    const response = await api.fetchCandidateProfiles(token);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCandidateProfileById = createAsyncThunk<
  CandidateProfile,
  { profileId: string; token: string },
  { rejectValue: string }
>("candidateProfiles/fetchById", async ({ profileId, token }, { rejectWithValue }) => {
  try {
    const response = await api.getCandidateProfileById(profileId, token);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createCandidateProfile = createAsyncThunk<
  CandidateProfile,
  { candidateId: string; data: CreateCandidateProfileRequest; token: string },
  { rejectValue: string }
>("candidateProfiles/create", async ({ candidateId, data, token }, { rejectWithValue }) => {
  try {
    const response = await api.createCandidateProfile(candidateId, data, token);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateCandidateProfile = createAsyncThunk<
  CandidateProfile,
  { profileId: string; data: UpdateCandidateProfileRequest; token: string },
  { rejectValue: string }
>("candidateProfiles/update", async ({ profileId, data, token }, { rejectWithValue }) => {
  try {
    const response = await api.updateCandidateProfile(profileId, data, token);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteCandidateProfile = createAsyncThunk<
  string,
  { profileId: string; token: string },
  { rejectValue: string }
>("candidateProfiles/delete", async ({ profileId, token }, { rejectWithValue }) => {
  try {
    await api.deleteCandidateProfile(profileId, token);
    return profileId;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const candidateProfileSlice = createSlice({
  name: "candidateProfiles",
  initialState,
  reducers: {
    resetCandidateProfileState: () => initialState,
    clearSelectedProfile: (state) => {
      state.selectedProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateProfiles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCandidateProfiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profiles = action.payload;
      })
      .addCase(fetchCandidateProfiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchCandidateProfileById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCandidateProfileById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedProfile = action.payload;
      })
      .addCase(fetchCandidateProfileById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(createCandidateProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCandidateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profiles.push(action.payload);
      })
      .addCase(createCandidateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(updateCandidateProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCandidateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.profiles.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
        if (state.selectedProfile?.id === action.payload.id) {
          state.selectedProfile = action.payload;
        }
      })
      .addCase(updateCandidateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(deleteCandidateProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCandidateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profiles = state.profiles.filter(p => p.id !== action.payload);
        if (state.selectedProfile?.id === action.payload) {
          state.selectedProfile = null;
        }
      })
      .addCase(deleteCandidateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetCandidateProfileState, clearSelectedProfile } = candidateProfileSlice.actions;
export default candidateProfileSlice.reducer;