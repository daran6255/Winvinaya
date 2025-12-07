import axios from "axios";
import type { ActivityLog } from "../models/activity_log";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/activities`;

export const getActivities = async (token: string) => {
  const response = await axios.get<{ status: string; data: ActivityLog[] }>(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
