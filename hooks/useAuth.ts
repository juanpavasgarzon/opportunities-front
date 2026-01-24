import { getMeApi, loginApi, logoutApi, resetMyPasswordApi, updateMeApi, UpdateMeRequest, LoginRequest } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { clearAuth } from '@/lib/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMeApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => updateMeApi(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      if (typeof window !== 'undefined') {
        const user = {
          id: String(data.id),
          username: data.username,
          name: data.full_name,
          full_name: data.full_name,
          email: data.email,
          role: data.role,
          active: data.active,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        localStorage.setItem('auth_user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-user-updated'));
      }
    },
    onError: (error: unknown) => {
      // If token was invalidated (401), the API client will handle logout and redirect
      // We just need to clean up React Query cache
      if (error instanceof ApiError && error.status === 401) {
        queryClient.removeQueries({ queryKey: authKeys.all });
      }
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ username_or_email, password }: LoginRequest) => loginApi(username_or_email, password),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Clear everything - API successfully deleted cookie
      queryClient.removeQueries({ queryKey: authKeys.all });
      clearAuth();
    },
    onError: () => {
      // Even if logout API fails (e.g., 401 because token already invalid), clear local state
      // This ensures we clean up even if the server-side cookie deletion failed
      queryClient.removeQueries({ queryKey: authKeys.all });
      clearAuth();
      // Don't re-throw - we want to clear state even if API fails
    },
  });
}

export function useResetMyPassword() {
  return useMutation({
    mutationFn: (newPassword: string) => resetMyPasswordApi(newPassword),
  });
}
