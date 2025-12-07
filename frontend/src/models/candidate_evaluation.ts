export interface CandidateEvaluation {
  id: string;
  candidate_profile_id: string;
  skills_with_level?: string;
  suitable_training?: string;
  comments?: string;
  remarks?: string;
  status: string;
  created_by?: UserInfo | null;
  updated_by?: UserInfo | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCandidateEvaluationRequest {
  candidate_profile_id: string;
  skills_with_level?: string;
  suitable_training?: string;
  comments?: string;
  remarks?: string;
  status: string;
}

export interface UpdateCandidateEvaluationRequest {
  skills_with_level?: string;
  suitable_training?: string;
  comments?: string;
  remarks?: string;
  status?: string;
}

export interface CandidateEvaluationResponse {
  status: "success" | "error";
  message?: string;
  data?: CandidateEvaluation;
  updated_by?: UserInfo;
  created_by?: UserInfo;
}

export interface CandidateEvaluationListResponse {
  status: "success" | "error";
  data: CandidateEvaluation[];
}

export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  role?: string;
}
