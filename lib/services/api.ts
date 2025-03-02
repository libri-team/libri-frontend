import { getBaseUrl } from '@/lib/utils';

// HTTP error class
export class HttpError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// API request options
interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

// API response type
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

// Function to handle API requests with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Include cookies for authentication
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const status = response.status;
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    if (response.ok) {
      const data = isJson ? await response.json() : await response.text();
      return { data, error: null, status };
    }
    
    // Handle error responses
    const errorText = isJson 
      ? await response.json().then(err => err.message || 'Unknown error') 
      : await response.text();
      
    const error = new HttpError(errorText, status);
    return { data: null, error, status };
  } catch (error) {
    // Handle network errors
    const networkError = error instanceof Error 
      ? error 
      : new Error('Network error occurred');
      
    return { data: null, error: networkError, status: 0 };
  }
}

// Utility function to add authorization header
export function withAuth(headers: Record<string, string> = {}) {
  // Get token from session/localStorage when needed
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') 
    : '';
    
  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  return headers;
} 