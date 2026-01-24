import { apiGet } from './client';

export interface LegalDocumentSection {
  title: string;
  content: string;
}

export interface LegalDocumentResponse {
  title: string;
  introduction?: string;
  sections: LegalDocumentSection[];
  last_updated?: string;
}

export async function getTermsAndConditions(locale: string = 'en'): Promise<LegalDocumentResponse> {
  return apiGet<LegalDocumentResponse>(`/legal/terms-and-conditions?language=${locale}`, { skipAuth: true });
}

export async function getPrivacyPolicy(locale: string = 'en'): Promise<LegalDocumentResponse> {
  return apiGet<LegalDocumentResponse>(`/legal/privacy-policy?language=${locale}`, { skipAuth: true });
}
