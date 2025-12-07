import axios from 'axios';
import type {
  CandidateProfileResponse,
  CandidateProfileListResponse,
  CreateCandidateProfileRequest,
  UpdateCandidateProfileRequest,
  ApiResponse,
} from '../models/candidate_verification';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/candidate-profiles`;

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

export const createCandidateProfile = async (
  candidateId: string,
  data: CreateCandidateProfileRequest,
  token: string
): Promise<CandidateProfileResponse> => {
  const response = await axios.post<CandidateProfileResponse>(
    `${API_URL}/${candidateId}`,
    data,
    getAuthHeaders(token)
  );
  return response.data;
};

export const fetchCandidateProfiles = async (
  token: string
): Promise<CandidateProfileListResponse> => {
  const response = await axios.get<CandidateProfileListResponse>(
    API_URL,
    getAuthHeaders(token)
  );
  return response.data;
};

export const getCandidateProfileById = async (
  profileId: string,
  token: string
): Promise<CandidateProfileResponse> => {
  const response = await axios.get<CandidateProfileResponse>(
    `${API_URL}/${profileId}`,
    getAuthHeaders(token)
  );
  return response.data;
};

export const updateCandidateProfile = async (
  profileId: string,
  data: UpdateCandidateProfileRequest,
  token: string
): Promise<CandidateProfileResponse> => {
  const response = await axios.put<CandidateProfileResponse>(
    `${API_URL}/${profileId}`,
    data,
    getAuthHeaders(token)
  );
  return response.data;
};

export const deleteCandidateProfile = async (
  profileId: string,
  token: string
): Promise<ApiResponse> => {
  const response = await axios.delete<ApiResponse>(
    `${API_URL}/${profileId}`,
    getAuthHeaders(token)
  );
  return response.data;
};