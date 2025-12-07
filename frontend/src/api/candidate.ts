// src/api/candidate.ts
import axios from 'axios';
import type {
  CandidateListResponse,
  CandidateResponse,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  ApiResponse,
} from '../models/candidate';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/candidates`;

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Create Candidate
export const createCandidate = async (
  data: CreateCandidateRequest | FormData,
  token: string
): Promise<CandidateResponse> => {
  const isForm = data instanceof FormData;
  const response = await axios.post<CandidateResponse>(API_URL, data, {
    ...getAuthHeaders(token),
    headers: {
      ...getAuthHeaders(token).headers,
      'Content-Type': isForm ? 'multipart/form-data' : 'application/json',
    },
  });
  return response.data;
};

// Get All Candidates
export const fetchCandidates = async (token: string): Promise<CandidateListResponse> => {
  const response = await axios.get<CandidateListResponse>(API_URL, getAuthHeaders(token));
  return response.data;
};

// Get Candidate by ID
export const getCandidateById = async (id: string, token: string): Promise<CandidateResponse> => {
  const response = await axios.get<CandidateResponse>(`${API_URL}/${id}`, getAuthHeaders(token));
  return response.data;
};

// Update Candidate
export const updateCandidate = async (
  id: string,
  data: UpdateCandidateRequest | FormData,
  token: string
): Promise<ApiResponse> => {
  const isForm = data instanceof FormData;
  const response = await axios.put<ApiResponse>(`${API_URL}/${id}`, data, {
    ...getAuthHeaders(token),
    headers: {
      ...getAuthHeaders(token).headers,
      'Content-Type': isForm ? 'multipart/form-data' : 'application/json',
    },
  });
  return response.data;
};

// Delete Candidate
export const deleteCandidate = async (id: string, token: string): Promise<ApiResponse> => {
  const response = await axios.delete<ApiResponse>(`${API_URL}/${id}`, getAuthHeaders(token));
  return response.data;
};
