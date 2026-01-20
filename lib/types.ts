export type UserRole = 'owner' | 'admin' | 'guest';

export interface User {
  id: string | number;
  username: string;
  name?: string;
  full_name?: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobOpportunity {
  id: string;
  title: string;
  job_type: string;
  experience: string;
  location: string;
  industry: string;
  information: string;
  company_name: string;
  company_info: string;
  salary_range: string;
  currency: string;
  post_date: string;
  reference?: string;
  created_at: string;
  updated_at: string;
}
