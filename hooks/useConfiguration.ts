import { getAppInfo, getConfiguration, updateCompanyConfiguration, updateEmailConfiguration, UpdateCompanyRequest, UpdateEmailRequest } from '@/lib/api/configuration';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const configurationKeys = {
  all: ['configuration'] as const,
  detail: () => [...configurationKeys.all, 'detail'] as const,
  appInfo: () => [...configurationKeys.all, 'app-info'] as const,
};

export function useConfiguration() {
  return useQuery({
    queryKey: configurationKeys.detail(),
    queryFn: getConfiguration,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAppInfo() {
  return useQuery({
    queryKey: configurationKeys.appInfo(),
    queryFn: getAppInfo,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCompanyConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCompanyRequest) => updateCompanyConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configurationKeys.detail() });
      queryClient.invalidateQueries({ queryKey: configurationKeys.appInfo() });
    },
  });
}

export function useUpdateEmailConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmailRequest) => updateEmailConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configurationKeys.detail() });
    },
  });
}
