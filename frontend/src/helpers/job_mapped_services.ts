import axios, { AxiosError } from 'axios';
import {
    AutoMapAllJobsResponse,
} from './model';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/job_map`;

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

export const autoMapAllJobs = async (
  jobmela_id: string
): Promise<AutoMapAllJobsResponse> => {
  try {
    const res = await axios.post<AutoMapAllJobsResponse>(
      `${BASE_URL}/auto_map_all_jobs/${jobmela_id}`
    );

    // ✅ ensure res.data.mappings matches the expected type
    if (!res.data.mappings) {
      res.data.mappings = [];
    }

    return res.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw new Error("This will never run but satisfies TS."); // fallback for TS return enforcement
  }
};

export const getJobMelaMetrics = async (jobmela_id: string) => {
    const res = await axios.get(`${BASE_URL}/metrics/jobmela/${jobmela_id}`);
    return res.data;
};

export const getCompaniesByJobMela = async (jobmela_id: string) => {
    return axios
        .get(`${BASE_URL}/companies_by_jobmela/${jobmela_id}`)
        .then(res => res.data);
};

export const getStudentsByJobMela = async (jobmela_id: string) => {
    return axios
        .get(`${BASE_URL}/students_by_jobmela/${jobmela_id}`)
        .then(res => res.data);
};

