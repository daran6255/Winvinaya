// model.ts

// ====================
// User Interface
// ====================

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  verified: boolean;
}

// ====================
// Signup Request Data
// ====================

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

// ====================
// Login Request Data
// ====================

export interface LoginData {
  email: string;
  password: string;
}

// ====================
// Login Response Data
// ====================

export interface LoginResponse {
  status: "success" | "error";
  result:
  | {
    id: number;
    name: string;
    email: string;
    verified: boolean;
    role: string;
  }
  | string;
  token?: string; // Present only on success
}

// ====================
// Signup Response Data
// ====================

export interface SignupResponse {
  status: 'success' | 'error';
  result: string;
}


// ====================
// Logout Response Data
// ====================

export interface LogoutResponse {
  msg: string;
}

// ====================
// Verify Token Response Data
// ====================

export interface VerifyTokenResponse {
  status: "success" | "error";
  message?: string;
  result?:
  | {
    id: number;
    name: string;
    email: string;
    verified: boolean;
    role: string;
  }
  | string;
}

// ====================
// Job Mela Interfaces
// ====================

export interface JobMelaOption {
  name: string;
  date: string; // or Date if you prefer
}

export interface JobMela {
  id: string;
  jobmela_name: string;
  jobmela_date: string; // format: YYYY-MM-DD
  jobmela_location: string;
  jobmela_partner: string;
  daysLeft?: number;
}

export interface JobMelaCreateRequest {
  jobmela_name: string;
  jobmela_date: string;
  jobmela_location: string;
  jobmela_partner: string;
}

export interface JobMelaUpdateRequest {
  jobmela_name?: string;
  jobmela_date?: string;
  jobmela_location?: string;
  jobmela_partner?: string;
}

export interface JobMelaResponseSuccess {
  status: "success";
  result: string | JobMela | JobMela[];
}

export interface JobMelaResponseError {
  status: "error";
  result: string;
}

export type JobMelaResponse = JobMelaResponseSuccess | JobMelaResponseError;

// ====================
// File Download API (Resume / Disability Certificate)
// ====================

// No request body needed — only `filename` in URL

// Successful response is a downloadable file (usually Blob or File on frontend)
export type FileDownloadResponse = Blob;

// Error responses can still be handled as JSON
export interface FileDownloadErrorResponse {
  status: "error";
  result: string;
}

// ====================
// Candidate Interfaces
// ====================

export interface Candidate {
  id: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  guardian_name: string;
  guardian_phone: string;
  city: string;
  state: string;
  pincode: string;
  degree: string;
  branch: string;
  disability_type: string;
  disability_percentage: number;
  trained_by_winvinaya: string;
  skills: string[];
  experience_type: string;
  years_of_experience?: number;
  current_status: string;
  previous_position: string;
  ready_to_relocate: string;
  resume_path: string;
  disability_certificate_path: string;
  jobmela_name: string;
  created_at: string;
}

// Used when registering a new candidate (multipart/form-data)
export interface CandidateCreateForm {
  name: string;
  gender: string;
  email: string;
  phone: string;
  guardian_name: string;
  guardian_phone: string;
  pincode: string;
  degree: string;
  branch: string;
  disability_type: string;
  disability_percentage: number;
  trained_by_winvinaya: string;
  skills: string[]; // Should be sent as JSON.stringify(skills) in FormData
  experience_type: string;
  years_of_experience?: number;
  current_status: string;
  previous_position: string;
  ready_to_relocate: string;
  resume: File; // PDF file
  disability_certificate: File; // PDF file
  jobmela_name: string;
  jobmela_id: string;
}

// Used when updating an existing candidate (JSON request)
export type CandidateUpdatePayload = Partial<Omit<Candidate, "id" | "created_at" | "resume_path" | "disability_certificate_path">>;

// ====================
// Candidate API Responses
// ====================

export interface CandidateResponseSuccess {
  status: "success";
  result: string | Candidate | Candidate[];
}

export interface CandidateResponseError {
  status: "error";
  message: string;
}

export type CandidateResponse = CandidateResponseSuccess | CandidateResponseError;

// src/models.ts

export type ExperienceType = "Fresher" | "Experienced";

export interface CandidateFormData {
  name: string;
  gender: string;
  email: string;
  phone: string;
  guardian_name: string;
  guardian_phone: string;
  city: string;
  state: string;
  pincode: string;
  degree: string;
  branch: string;
  disability_type: string;
  disability_percentage: number;
  trained_by_winvinaya: string;
  skills: string[];
  experience_type: ExperienceType | "";
  years_of_experience?: number;
  current_status: string;
  previous_position: string;
  ready_to_relocate: string;
  resume_path: File | null;
  disability_certificate_path: File | null;
  jobmela_name: string;
}

// ====================
// Company API Responses
// ====================


export interface Company {
  id: string;
  jobMela: string;
  companyName: string;
  type: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  numParticipants: number;
  participants: Participant[];
  createdAt: string;
}

export interface Participant {
  name: string;
  contact: string;
  designation: string;
  email: string;
}

export interface CompanyDropdown {
  id: string;
  name: string;
}

export interface CompanyCreateForm {
  jobMela: string;
  companyName: string;
  type: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  numParticipants: string; // <-- keep this as string
  participants: Participant[];

}

export interface CompanyUpdatePayload {
  jobMela: string;
  companyName: string;
  type: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  numParticipants: string; // keep as string for form compatibility
  participants: Participant[];
}

export interface CompanyResponseSuccess {
  status: "success";
  result: string | Company | Company[];
}

export interface CompanyResponseError {
  status: "error";
  message: string;
}

export type CompanyResponse = CompanyResponseSuccess | CompanyResponseError;

// ====================
// Simple Job Interfaces for Table Display
// ====================

export interface SimpleJob {
  id: string;
  role: string;
}

export interface CompanyWithJobs {
  id: string;
  name: string;
  type: string;
  jobs: SimpleJob[];
}

export interface JobCreateForm {
  companyName: string; // used to lookup company.id on backend
  jobRole: string;
  skills: string[]; // list of skills
  experienceLevel: string;
  educationQualification: string[];
  numOpenings: number;
  location: string;
  disabilityPreferred?: string;
  approxSalary?: number;
  rolesAndResponsibilities: string;
  description: string;
}

// Job Update Form (same structure, reused)
export type JobUpdatePayload = JobCreateForm;

// Job object returned from backend
export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  jobRole: string;
  skills: string[];
  experienceLevel: string;
  educationQualification: string[];
  numOpenings: number;
  location: string;
  disabilityPreferred?: string;
  approxSalary?: number;
  rolesAndResponsibilities: string;
  description: string;
  createdAt: string;
}

// Standard API response
export interface JobResponse {
  status: "success" | "error";
  message?: string;
  result?: Job[] | Job;
  id?: string; // returned on create
}

export interface MappingSummary {
  job_id: string;
  mapped_candidates: {
    id: string;
    matched_skills: { skill: string; level: string }[];
  }[];
}


export interface AutoMapAllJobsResponse {
  status: string;
  mappings: MappingSummary[];
}


// ====================
// Sourcing Interfaces
// ====================

export interface Sourcing {
  id: string;
  candidate_id: string;
  trained_by_winvinaya: "Yes" | "No";

  // For candidates trained by WinVinaya
  batch_id?: string;
  domain?: string; // e.g. ITFS, ITST, BFSI, etc.
  duration_from_month?: number;
  duration_from_year?: number;
  duration_to_month?: number;
  duration_to_year?: number;

  // For candidates not trained yet
  willing_for_training?: "Yes" | "No";

  // Common
  skills?: SkillLevel[];

  created_at: string;
}

export interface SkillLevel {
  skill: string;
  level: string;
}

// Used for creating a sourcing record
export interface SourcingCreateRequest {
  candidate_id: string;
  trained_by_winvinaya: "Yes" | "No";

  // For trained candidates
  batch_id?: string;
  domain?: string;
  duration_from_month?: number;
  duration_from_year?: number;
  duration_to_month?: number;
  duration_to_year?: number;

  // For untrained candidates
  willing_for_training?: "Yes" | "No";

  // Common
  skills?: SkillLevel[];
}

// Used for updating a sourcing record
export type SourcingUpdateRequest = Partial<Omit<Sourcing, "id" | "created_at">>;

// ====================
// Sourcing API Responses
// ====================

export interface SourcingResponseSuccess {
  status: "success";
  result: string | Sourcing | Sourcing[];
}

export interface SourcingResponseError {
  status: "error";
  result: string;
}

export type SourcingResponse = SourcingResponseSuccess | SourcingResponseError;
