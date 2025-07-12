import axios, { AxiosError } from "axios";
import { JobMelaCreateRequest, JobMelaResponse, JobMelaUpdateRequest } from "./model";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/jobmela`; // or your backend base URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // withCredentials: true, // Only if your backend uses cookies/sessions for auth
});

// Centralized error handling
const handleError = (error: AxiosError): never => {
  if (error.response) {
    console.error("API Error:", error.response.data);
    throw error.response.data || { message: "Unexpected error occurred" };
  } else if (error.request) {
    console.error("No response received:", error.request);
    throw { message: "No response from server" };
  } else {
    console.error("Request setup error:", error.message);
    throw { message: "Error in request setup" };
  }
};

// Service functions

export const createJobMela = async (
  data: JobMelaCreateRequest
): Promise<JobMelaResponse> => {
  try {
    const response = await axiosInstance.post<JobMelaResponse>("/add", data);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const getAllJobMelas = async (): Promise<JobMelaResponse> => {
  try {
    const response = await axiosInstance.get<JobMelaResponse>("/get_all");
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const getJobMelaById = async (id: string): Promise<JobMelaResponse> => {
  try {
    const response = await axiosInstance.get<JobMelaResponse>(`/get/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const updateJobMela = async (
  id: string,
  data: JobMelaUpdateRequest
): Promise<JobMelaResponse> => {
  try {
    const response = await axiosInstance.put<JobMelaResponse>(`/update/${id}`, data);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const deleteJobMela = async (id: string): Promise<JobMelaResponse> => {
  try {
    const response = await axiosInstance.delete<JobMelaResponse>(`/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};
