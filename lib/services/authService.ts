import { apiRequest } from './api';

// Auth token response
export interface AuthTokenResponse {
  accessToken: string;
}

// Test token response
export interface TestTokenResponse {
  token: string;
}

// Auth service functions
export const authService = {
  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    const response = await apiRequest<AuthTokenResponse>(
      '/auth/refresh',
      { 
        method: 'POST',
        // credentials handled in apiRequest function
      }
    );
    
    if (response.error) {
      throw response.error;
    }
    
    const accessToken = response.data?.accessToken;
    
    if (accessToken) {
      // Store the new token
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }
      return accessToken;
    }
    
    throw new Error('No access token received');
  },
  
  // Get test token (for development)
  async getTestToken(testEmail: string): Promise<string> {
    const params = new URLSearchParams({
      test_email: testEmail,
    });
    
    const response = await apiRequest<TestTokenResponse>(
      `/auth/test/token?${params}`
    );
    
    if (response.error) {
      throw response.error;
    }
    
    const token = response.data?.token;
    
    if (token) {
      // Store the token
      if (typeof window !== 'undefined') {
        const accessToken = token.replace('Bearer ', '');
        localStorage.setItem('accessToken', accessToken);
      }
      return token;
    }
    
    throw new Error('No test token received');
  },
  
  // Log out
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      // Additional logout logic here
    }
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  },
  
  // Get stored token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },
}; 