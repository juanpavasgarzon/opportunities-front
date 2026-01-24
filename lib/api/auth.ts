import { UserRole } from '../types';
import { apiGet, apiPost, apiPut } from './client';

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type MeResponse = LoginResponse;

export interface UpdateMeRequest {
  full_name?: string;
  username?: string;
  email?: string;
}

export async function loginApi(usernameOrEmail: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', {
    username_or_email: usernameOrEmail,
    password,
  });
}

export async function getMeApi(): Promise<MeResponse> {
  return apiGet<MeResponse>('/auth/me');
}

export async function updateMeApi(data: UpdateMeRequest): Promise<MeResponse> {
  return apiPut<MeResponse>('/auth/me', data);
}

export async function logoutApi(): Promise<void> {
  try {
    await apiPost<void>('/auth/logout');
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      return;
    }
    throw error;
  }
}

export interface ChangePasswordRequest {
  new_password: string;
}

export async function resetMyPasswordApi(newPassword: string): Promise<void> {
  await apiPost<void>('/auth/change-password', {
    new_password: newPassword,
  });
}
