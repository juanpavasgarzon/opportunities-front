import { getMeApi, loginApi, logoutApi, resetMyPasswordApi, updateMeApi } from '@/lib/api/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMeApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (full_name: string) => updateMeApi(full_name),
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
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      loginApi(username, password),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new Event('auth-user-removed'));
      }
    },
    onError: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new Event('auth-user-removed'));
      }
    },
  });
}

export function useResetMyPassword() {
  return useMutation({
    mutationFn: (newPassword: string) => resetMyPasswordApi(newPassword),
  });
}
