import {
  CandidateCreateForm,
  CandidateUpdatePayload,
  CandidateResponse,
} from "../helpers/model";
import axios, { AxiosError } from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/candidates`;

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

export const addCandidate = async (form: CandidateCreateForm): Promise<CandidateResponse> => {
  try {
    const formData = new FormData();

    // Append fields to formData
    Object.entries(form).forEach(([key, value]) => {
      if (key === "skills") {
        formData.append("skills", JSON.stringify(value));
      } else if (key === "resume" || key === "disability_certificate") {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axios.post(`${BASE_URL}/add`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const getAllCandidates = async (): Promise<CandidateResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/get_all`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const getCandidateById = async (id: string): Promise<CandidateResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/get/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const updateCandidate = async (
  id: string,
  payload: CandidateUpdatePayload
): Promise<CandidateResponse> => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const deleteCandidate = async (id: string): Promise<CandidateResponse> => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};
