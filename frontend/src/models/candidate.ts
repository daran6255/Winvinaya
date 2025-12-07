export interface Candidate {
  id: string;
  candidate_id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  guardian_name: string;
  guardian_phone: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  degree: string;
  branch: string;
  disability_type: string;
  disability_percentage: number;
  experience_type: string;
  skills?: string[]; // Parsed from JSON in backend
  disability_certificate_path?: string;
  updated_by?: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  } | null;
  profile_id?: string | null; // ✅ Newly added field
  created_at: string;
  updated_at: string;
}


export interface CreateCandidateRequest {
  name: string;
  email: string;
  phone: string;
  gender: string;
  guardian_name: string;
  guardian_phone: string;
  pincode: string;
  degree: string;
  branch: string;
  disability_type: string;
  disability_percentage: number;
  experience_type: string;
  skills?: string[]; // or undefined
  disability_certificate?: File;
}

export interface UpdateCandidateRequest {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  guardian_name?: string;
  guardian_phone?: string;
  pincode?: string;
  degree?: string;
  branch?: string;
  disability_type?: string;
  disability_percentage?: number;
  experience_type?: string;
  skills?: string[];
  disability_certificate?: File;
}

export interface CandidateResponse {
  data: Candidate;
  message?: string;
}

export interface CandidateListResponse {
  data: Candidate[];
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
