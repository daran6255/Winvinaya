import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Candidate,
  CreateCandidateRequest,
  UpdateCandidateRequest,
} from "../../models/candidate";
import * as candidateApi from "../../api/candidate";
import { AxiosError } from "axios";

type CandidateStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface CandidateState {
  candidates: Candidate[];
  selectedCandidate?: Candidate;
  status: CandidateStatus;
  error?: string;
}

const initialState: CandidateState = {
  candidates: [],
  selectedCandidate: undefined,
  status: 'idle',
  error: undefined,
};

// Utility to get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return String(error);
};

// Thunks

export const fetchCandidates = createAsyncThunk<Candidate[], string>(
  "candidate/fetchCandidates",
  async (token, { rejectWithValue }) => {
    try {
      const res = await candidateApi.fetchCandidates(token);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getCandidateById = createAsyncThunk<
  Candidate,
  { id: string; token: string }
>(
  "candidate/getCandidateById",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const res = await candidateApi.getCandidateById(id, token);
      return res.data; // Assuming CandidateResponse has a `.data` field with `Candidate`
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createCandidate = createAsyncThunk<
  Candidate,
  { data: CreateCandidateRequest; token: string }
>(
  "candidate/createCandidate",
  async ({ data, token }, { rejectWithValue }) => {
    try {
      const res = await candidateApi.createCandidate(data, token);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCandidate = createAsyncThunk<
  { candidateId: string; data: UpdateCandidateRequest },
  { candidateId: string; data: UpdateCandidateRequest; token: string }
>(
  "candidate/updateCandidate",
  async ({ candidateId, data, token }, { rejectWithValue }) => {
    try {
      await candidateApi.updateCandidate(candidateId, data, token);
      return { candidateId, data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteCandidate = createAsyncThunk<
  string,
  { candidateId: string; token: string }
>(
  "candidate/deleteCandidate",
  async ({ candidateId, token }, { rejectWithValue }) => {
    try {
      await candidateApi.deleteCandidate(candidateId, token);
      return candidateId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Slice

const candidateSlice = createSlice({
  name: "candidate",
  initialState,
  reducers: {
    resetCandidateState: () => initialState,
    clearSelectedCandidate: (state) => {
      state.selectedCandidate = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.candidates = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(getCandidateById.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(getCandidateById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedCandidate = action.payload;
      })
      .addCase(getCandidateById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(createCandidate.fulfilled, (state, action) => {
        state.candidates.push(action.payload);
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        const index = state.candidates.findIndex(
          (c) => c.id === action.payload.candidateId
        );
        if (index !== -1) {
          state.candidates[index] = {
            ...state.candidates[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.candidates = state.candidates.filter(
          (c) => c.id !== action.payload
        );
      });
  },
});

export const { resetCandidateState, clearSelectedCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;
