import { User } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

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
    full_name: string;
    username: string;
    email: string;
    role: 'owner' | 'admin';
    active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export async function getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('limit', params.pageSize.toString());
  if (params?.search) queryParams.append('search', params.search);

  const apiResponse = await apiGet<ApiPaginatedResponse>(`/users?${queryParams.toString()}`);

  return {
    data: apiResponse.data.map(user => ({
      id: String(user.id),
      username: user.username,
      name: user.full_name,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      active: user.active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    })),
    total: apiResponse.total,
    page: apiResponse.page,
    pageSize: apiResponse.limit,
    totalPages: apiResponse.total_pages,
  };
}


interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: 'owner' | 'admin';
  active?: boolean;
}

interface UpdateUserResponse {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'owner' | 'admin';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  const requestBody: UpdateUserRequest = {};
  if (user.username !== undefined) {
    requestBody.username = user.username;
  }
  if (user.email !== undefined) {
    requestBody.email = user.email;
  }
  if ('password' in user && user.password !== undefined) {
    requestBody.password = user.password as string;
  }
  if (user.role !== undefined && (user.role === 'owner' || user.role === 'admin')) {
    requestBody.role = user.role;
  }
  if (user.active !== undefined) {
    requestBody.active = user.active;
  }

  const apiResponse = await apiPut<UpdateUserResponse>(`/users/${id}`, requestBody);

  return {
    id: String(apiResponse.id),
    username: apiResponse.username,
    name: apiResponse.full_name,
    full_name: apiResponse.full_name,
    email: apiResponse.email,
    role: apiResponse.role,
    active: apiResponse.active,
    created_at: apiResponse.created_at,
    updated_at: apiResponse.updated_at,
  };
}

export async function deactivateUser(id: string): Promise<void> {
  await apiPost<void>(`/users/${id}/deactivate`);
}

export async function activateUser(id: string): Promise<User> {
  return updateUser(id, { active: true });
}

export async function deleteUser(id: string): Promise<void> {
  await apiDelete<void>(`/users/${id}`);
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  await apiPost<void>(`/users/${id}/reset-password`, {
    new_password: newPassword,
  });
}

interface CreateUserRequest {
  full_name: string;
  username: string;
  email: string;
  password: string;
  role: 'owner' | 'admin';
}

interface CreateUserResponse {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'owner' | 'admin';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<User> {
  const requestBody: CreateUserRequest = {
    full_name: user.name || user.full_name || '',
    username: user.username,
    email: user.email,
    password: user.password,
    role: (user.role === 'owner' || user.role === 'admin') ? user.role : 'admin',
  };

  const apiResponse = await apiPost<CreateUserResponse>('/users', requestBody);

  return {
    id: String(apiResponse.id),
    username: apiResponse.username,
    name: apiResponse.full_name,
    full_name: apiResponse.full_name,
    email: apiResponse.email,
    role: apiResponse.role,
    active: apiResponse.active,
    created_at: apiResponse.created_at,
    updated_at: apiResponse.updated_at,
  };
}
