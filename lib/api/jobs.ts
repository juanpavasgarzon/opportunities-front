import { apiDelete, apiGet, apiPost, apiPut } from './client';
import { JobOpportunity } from '../types';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ApiPaginatedResponse {
  data: Array<{
    id: number;
    title: string;
    reference: string | null;
    job_type: string | null;
    experience: string | null;
    location: string | null;
    industry: string | null;
    information: string | null;
    company_name: string | null;
    company_info: string | null;
    salary_range: string | null;
    currency: string | null;
    post_date: string | null;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export async function getJobs(params?: PaginationParams): Promise<PaginatedResponse<JobOpportunity>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('limit', params.pageSize.toString());
  if (params?.search) queryParams.append('search', params.search);

  const apiResponse = await apiGet<ApiPaginatedResponse>(`/opportunities?${queryParams.toString()}`, { skipAuth: true });

  return {
    data: apiResponse.data.map(job => ({
      id: String(job.id),
      title: job.title,
      reference: job.reference || '',
      job_type: job.job_type || '',
      experience: job.experience || '',
      location: job.location || '',
      industry: job.industry || '',
      information: job.information || '',
      company_name: job.company_name || '',
      company_info: job.company_info || '',
      salary_range: job.salary_range || '',
      currency: job.currency || '',
      post_date: job.post_date || new Date().toISOString().split('T')[0],
      created_at: job.created_at,
      updated_at: job.updated_at,
    })),
    total: apiResponse.total,
    page: apiResponse.page,
    pageSize: apiResponse.limit,
    totalPages: apiResponse.total_pages,
  };
}

interface ApiJobResponse {
  id: number;
  title: string;
  reference: string | null;
  job_type: string | null;
  experience: string | null;
  location: string | null;
  industry: string | null;
  information: string | null;
  company_name: string | null;
  company_info: string | null;
  salary_range: string | null;
  currency: string | null;
  post_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function getJobById(id: string): Promise<JobOpportunity | null> {
  try {
    const apiResponse = await apiGet<ApiJobResponse>(`/opportunities/${id}`, { skipAuth: true });

    return {
      id: String(apiResponse.id),
      title: apiResponse.title,
      reference: apiResponse.reference || '',
      job_type: apiResponse.job_type || '',
      experience: apiResponse.experience || '',
      location: apiResponse.location || '',
      industry: apiResponse.industry || '',
      information: apiResponse.information || '',
      company_name: apiResponse.company_name || '',
      company_info: apiResponse.company_info || '',
      salary_range: apiResponse.salary_range || '',
      currency: apiResponse.currency || '',
      post_date: apiResponse.post_date || new Date().toISOString().split('T')[0],
      created_at: apiResponse.created_at,
      updated_at: apiResponse.updated_at,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
}

interface CreateJobRequest {
  title: string;
  reference?: string | null;
  job_type?: string | null;
  experience?: string | null;
  location?: string | null;
  industry?: string | null;
  information?: string | null;
  company_name?: string | null;
  company_info?: string | null;
  salary_range?: string | null;
  currency?: string | null;
  post_date?: string | null;
}

export async function createJob(job: Omit<JobOpportunity, 'id' | 'created_at' | 'updated_at'>): Promise<JobOpportunity> {
  const requestBody: CreateJobRequest = {
    title: job.title,
    reference: job.reference || null,
    job_type: job.job_type || null,
    experience: job.experience || null,
    location: job.location || null,
    industry: job.industry || null,
    information: job.information || null,
    company_name: job.company_name || null,
    company_info: job.company_info || null,
    salary_range: job.salary_range || null,
    currency: job.currency || null,
    post_date: job.post_date || null,
  };

  const apiResponse = await apiPost<ApiJobResponse>('/opportunities', requestBody);

  return {
    id: String(apiResponse.id),
    title: apiResponse.title,
    reference: apiResponse.reference || '',
    job_type: apiResponse.job_type || '',
    experience: apiResponse.experience || '',
    location: apiResponse.location || '',
    industry: apiResponse.industry || '',
    information: apiResponse.information || '',
    company_name: apiResponse.company_name || '',
    company_info: apiResponse.company_info || '',
    salary_range: apiResponse.salary_range || '',
    currency: apiResponse.currency || '',
    post_date: apiResponse.post_date || new Date().toISOString().split('T')[0],
    created_at: apiResponse.created_at,
    updated_at: apiResponse.updated_at,
  };
}

interface UpdateJobRequest {
  title?: string | null;
  reference?: string | null;
  job_type?: string | null;
  experience?: string | null;
  location?: string | null;
  industry?: string | null;
  information?: string | null;
  company_name?: string | null;
  company_info?: string | null;
  salary_range?: string | null;
  currency?: string | null;
  post_date?: string | null;
}

export interface UpdateJobParams {
  id: string;
  data: Partial<JobOpportunity>;
}

export async function updateJob(id: string, job: Partial<JobOpportunity>): Promise<JobOpportunity> {
  const requestBody: UpdateJobRequest = {};
  if (job.title !== undefined) {
    requestBody.title = job.title || null;
  }
  if (job.reference !== undefined) {
    requestBody.reference = job.reference || null;
  }
  if (job.job_type !== undefined) {
    requestBody.job_type = job.job_type || null;
  }
  if (job.experience !== undefined) {
    requestBody.experience = job.experience || null;
  }
  if (job.location !== undefined) {
    requestBody.location = job.location || null;
  }
  if (job.industry !== undefined) {
    requestBody.industry = job.industry || null;
  }
  if (job.information !== undefined) {
    requestBody.information = job.information || null;
  }
  if (job.company_name !== undefined) {
    requestBody.company_name = job.company_name || null;
  }
  if (job.company_info !== undefined) {
    requestBody.company_info = job.company_info || null;
  }
  if (job.salary_range !== undefined) {
    requestBody.salary_range = job.salary_range || null;
  }
  if (job.currency !== undefined) {
    requestBody.currency = job.currency || null;
  }
  if (job.post_date !== undefined) {
    requestBody.post_date = job.post_date || null;
  }

  const apiResponse = await apiPut<ApiJobResponse>(`/opportunities/${id}`, requestBody);

  return {
    id: String(apiResponse.id),
    title: apiResponse.title,
    reference: apiResponse.reference || '',
    job_type: apiResponse.job_type || '',
    experience: apiResponse.experience || '',
    location: apiResponse.location || '',
    industry: apiResponse.industry || '',
    information: apiResponse.information || '',
    company_name: apiResponse.company_name || '',
    company_info: apiResponse.company_info || '',
    salary_range: apiResponse.salary_range || '',
    currency: apiResponse.currency || '',
    post_date: apiResponse.post_date || new Date().toISOString().split('T')[0],
    created_at: apiResponse.created_at,
    updated_at: apiResponse.updated_at,
  };
}

export async function deleteJob(id: string): Promise<void> {
  await apiDelete<void>(`/opportunities/${id}`);
}

export interface ApplyToJobRequest {
  name: string;
  email: string;
  phone: string;
  cv: File;
}

export async function applyToJob(id: string, data: ApplyToJobRequest): Promise<void> {
  if (!data.name || !data.name.trim()) {
    throw new Error('Name is required');
  }
  if (!data.email || !data.email.trim()) {
    throw new Error('Email is required');
  }
  if (!data.phone || !data.phone.trim()) {
    throw new Error('Phone is required');
  }
  if (!data.cv) {
    throw new Error('CV file is required');
  }

  const maxSize = 10 * 1024 * 1024;
  if (data.cv.size > maxSize) {
    throw new Error('CV file size exceeds 10MB limit');
  }

  const formData = new FormData();
  formData.append('name', data.name.trim());
  formData.append('email', data.email.trim());
  formData.append('phone', data.phone.trim());
  formData.append('cv', data.cv);

  await apiPost<void>(`/opportunities/${id}/apply`, formData, { skipAuth: true });
}
