import { apiClient } from './client';
import type { User } from '@/store/slices/authSlice';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Login user
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/api/auth/login',
    credentials
  );

  // Set the token for subsequent requests
  apiClient.setToken(response.token);

  return response;
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/api/auth/register',
    data
  );

  // Set the token for subsequent requests
  apiClient.setToken(response.token);

  return response;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout');

  // Clear the token
  apiClient.setToken(null);
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/api/auth/refresh',
    { refreshToken }
  );

  // Update the token
  apiClient.setToken(response.token);

  return response;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  return apiClient.get<User>('/api/auth/me');
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  return apiClient.patch<User>('/api/auth/profile', data);
};
