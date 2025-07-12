import {
  SourcingCreateRequest,
  SourcingUpdateRequest,
  SourcingResponse,
} from "../helpers/model";
import axios, { AxiosError } from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/sourcing`;

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

export const addSourcing = async (
  data: SourcingCreateRequest
): Promise<SourcingResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/add`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const getAllSourcing = async (): Promise<SourcingResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/get_all`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const getSourcingById = async (id: string): Promise<SourcingResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/get/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const updateSourcing = async (
  id: string,
  data: SourcingUpdateRequest
): Promise<SourcingResponse> => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const deleteSourcing = async (id: string): Promise<SourcingResponse> => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};
