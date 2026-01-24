import { clearAuth } from '../auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRedirecting = false;

function handleUnauthorized(): void {
  if (typeof window !== 'undefined' && !isRedirecting) {
    const currentPath = window.location.pathname;
    // Don't redirect if we're already on login page
    if (currentPath.includes('/login')) {
      return;
    }
    
    isRedirecting = true;
    clearAuth();
    const locale = currentPath.split('/')[1] || 'en';
    // Use window.location.replace to avoid adding to history and prevent loops
    window.location.replace(`/${locale}/login`);
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('API_BASE_URL is not configured');
  }

  const { skipAuth = false, ...fetchOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const existingHeaders = fetchOptions.headers as Record<string, string> | undefined;
  const headers: Record<string, string> = existingHeaders ? { ...existingHeaders } : {};
  
  const isFormData = fetchOptions.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: skipAuth ? 'omit' : 'include',
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: { message?: string; error?: string; statusCode?: number } = {};

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = { message: await response.text() };
        }
      } catch {
        errorData = { message: 'Request failed' };
      }

      if (response.status === 401 || response.status === 403) {
        // Don't auto-redirect for logout endpoint - let the component handle it
        const isLogoutEndpoint = endpoint.includes('/auth/logout');
        
        // Clear auth and redirect to login before throwing error (except for logout)
        if (response.status === 401 && !options.skipAuth && !isLogoutEndpoint) {
          handleUnauthorized();
        }
        // Use message from errorData, or error field, or default message
        const errorMessage = errorData.message || errorData.error || 'Unauthorized';
        throw new ApiError(
          errorMessage,
          response.status,
          errorData
        );
      }

      if (response.status === 404) {
        throw new ApiError(
          errorData.message || 'Resource not found',
          response.status,
          errorData
        );
      }

      if (response.status === 400) {
        throw new ApiError(
          errorData.message || 'Bad request',
          response.status,
          errorData
        );
      }

      if (response.status === 413) {
        throw new ApiError(
          errorData.message || 'File size exceeds limit',
          response.status,
          errorData
        );
      }

      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return (await response.text()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new ApiError(
          `Network error: Unable to connect to the server. Please check if the server is running at ${API_BASE_URL || 'the configured URL'}`
        );
      }
      if (error.message.includes('NetworkError') || error.message.includes('Network request failed')) {
        throw new ApiError(
          `Network error: Unable to connect to the server. Please check if the server is running at ${API_BASE_URL || 'the configured URL'}`
        );
      }
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}

export function apiGet<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

export function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  const isFormData = data instanceof FormData;
  
  const headers: Record<string, string> = {};
  if (!isFormData) {
    const existingHeaders = options?.headers as Record<string, string> | undefined;
    if (existingHeaders) {
      Object.assign(headers, existingHeaders);
    }
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  } else {
    const existingHeaders = options?.headers as Record<string, string> | undefined;
    if (existingHeaders) {
      Object.assign(headers, existingHeaders);
    }
  }

  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
}

export function apiPut<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  const isFormData = data instanceof FormData;
  
  const headers: Record<string, string> = {};
  if (!isFormData) {
    const existingHeaders = options?.headers as Record<string, string> | undefined;
    if (existingHeaders) {
      Object.assign(headers, existingHeaders);
    }
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  } else {
    const existingHeaders = options?.headers as Record<string, string> | undefined;
    if (existingHeaders) {
      Object.assign(headers, existingHeaders);
    }
  }

  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
}

export function apiDelete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

export { API_BASE_URL };
