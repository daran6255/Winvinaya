import {
  CompanyCreateForm,
  CompanyUpdatePayload,
  CompanyResponse,
} from "../helpers/model";
import axios, { AxiosError } from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`;

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

export const addCompany = async (form: CompanyCreateForm): Promise<CompanyResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/add`, form, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const getAllCompanies = async (): Promise<CompanyResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/get_all`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const getCompanyById = async (id: string): Promise<CompanyResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/get/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const updateCompany = async (
  id: string,
  payload: CompanyUpdatePayload
): Promise<CompanyResponse> => {
  try {
    const response = await axios.put(`${BASE_URL}/put/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

export const deleteCompany = async (id: string): Promise<CompanyResponse> => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};
