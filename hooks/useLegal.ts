import { getPrivacyPolicy, getTermsAndConditions } from '@/lib/api/legal';
import { useQuery } from '@tanstack/react-query';

export const legalKeys = {
  all: ['legal'] as const,
  termsAndConditions: (locale: string) => [...legalKeys.all, 'terms-and-conditions', locale] as const,
  privacyPolicy: (locale: string) => [...legalKeys.all, 'privacy-policy', locale] as const,
};

export function useTermsAndConditions(locale: string = 'en') {
  return useQuery({
    queryKey: legalKeys.termsAndConditions(locale),
    queryFn: () => getTermsAndConditions(locale),
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function usePrivacyPolicy(locale: string = 'en') {
  return useQuery({
    queryKey: legalKeys.privacyPolicy(locale),
    queryFn: () => getPrivacyPolicy(locale),
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
