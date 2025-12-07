export interface CandidateProfile {
  id: string;
  candidate_id: string;
  candidate_name: string;
  trained_by_winvinaya: boolean;
  training_domain?: string;
  training_from?: string;
  training_to?: string;
  employment_status: string;
  company_name?: string;
  position?: string;
  current_ctc?: string;
  total_experience_years?: number;
  notice_period?: string;
  willing_for_training?: string;
  ready_to_relocate?: string;
  intrested_training?: string;
  created_by?: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  } | null;
updated_by?: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCandidateProfileRequest {
  trained_by_winvinaya: boolean;
  training_domain?: string;
  training_from?: string;
  training_to?: string;
  employment_status: string;
  company_name?: string;
  position?: string;
  current_ctc?: string;
  total_experience_years?: number;
  notice_period?: string;
  willing_for_training?: string;
  ready_to_relocate?: string;
  intrested_training?: string;
}

export type UpdateCandidateProfileRequest = Partial<CreateCandidateProfileRequest>;

export interface CandidateProfileResponse {
  status: string;
  message: string;
  data: CandidateProfile;
}

export interface CandidateProfileListResponse {
  status: string;
  data: CandidateProfile[];
}

export interface ApiResponse {
  status: string;
  message: string;
  data: CandidateProfile;
}
