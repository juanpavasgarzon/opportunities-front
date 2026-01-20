import { apiPost } from './client';

interface ApiTestConnectionResponse {
  connection_status: 'Ok' | 'Failed';
  message: string | null;
}

export interface TestConnectionResponse {
  success: boolean;
}

export async function testEmailConnection(): Promise<TestConnectionResponse> {
  const apiResponse = await apiPost<ApiTestConnectionResponse>('/mail/test-smtp');

  return {
    success: apiResponse.connection_status === 'Ok',
  };
}
