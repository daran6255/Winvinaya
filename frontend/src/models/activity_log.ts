export interface ChangedField {
  old: string | number | boolean | null;
  new: string | number | boolean | null;
}

export interface ActivityLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  changed_fields: Record<string, ChangedField>;
  timestamp: string; // ISO date string from backend
  user_id: string;
  role: string;
  username?: string;
}

// Optional: For API response type safety
export interface ActivityLogApiResponse {
  status: "success" | "error";
  data: ActivityLog[];
  message?: string; // only present on error
}
