import { apiGet, apiPost, apiPut } from './client';

export interface LoginRequest {
  username_or_email: string; // Can be username or email
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
  // Don't use skipAuth - we need to send the cookie so the backend can delete it
  // Even if it returns 401, we'll handle it gracefully
  try {
    await apiPost<void>('/auth/logout');
  } catch (error) {
    // If logout fails (e.g., token already invalid), that's okay
    // We'll still clear local state
    if (error instanceof Error && error.message.includes('401')) {
      // Token already invalid, which is fine for logout
      return;
    }
    throw error;
  }
}

export interface ChangePasswordRequest {
  new_password: string;
}

export async function resetMyPasswordApi(newPassword: string): Promise<void> {
  // Use /auth/change-password endpoint for authenticated users
  await apiPost<void>('/auth/change-password', {
    new_password: newPassword,
  });
}
