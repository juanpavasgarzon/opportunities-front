import { apiGet, apiPost, apiPut } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'owner' | 'admin' | 'guest';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type MeResponse = LoginResponse;

export interface UpdateMeRequest {
  full_name: string;
}

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', {
    username,
    password,
  });
}

export async function getMeApi(): Promise<MeResponse> {
  return apiGet<MeResponse>('/auth/me');
}

export async function updateMeApi(full_name: string): Promise<MeResponse> {
  return apiPut<MeResponse>('/auth/me', {
    full_name,
  });
}

export async function logoutApi(): Promise<void> {
  try {
    await apiPost<void>('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  }
}

export interface ResetMyPasswordRequest {
  new_password: string;
}

export async function resetMyPasswordApi(newPassword: string): Promise<void> {
  const me = await getMeApi();
  await apiPost<void>(`/users/${me.id}/reset-password`, {
    new_password: newPassword,
  });
}
