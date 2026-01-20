import { apiGet, apiPut } from './client';

export interface Configuration {
  id: number;
  recipient_emails: string | null;
  copy_emails: string | null;
  blind_copy_emails: string | null;
  company_name: string | null;
  company_logo: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppInfo {
  company_name: string | null;
  company_logo: string | null;
}

export interface UpdateCompanyRequest {
  company_name?: string | null;
  company_logo?: string | null;
}

export interface UpdateEmailRequest {
  recipient_emails?: string | null;
  copy_emails?: string | null;
  blind_copy_emails?: string | null;
}

export async function getConfiguration(): Promise<Configuration> {
  return apiGet<Configuration>('/configuration');
}

export async function getAppInfo(): Promise<AppInfo> {
  return apiGet<AppInfo>('/configuration/app-info', { skipAuth: true });
}

export async function updateCompanyConfiguration(data: UpdateCompanyRequest): Promise<Configuration> {
  return apiPut<Configuration>('/configuration/company', data);
}

export async function updateEmailConfiguration(data: UpdateEmailRequest): Promise<Configuration> {
  return apiPut<Configuration>('/configuration/email', data);
}
