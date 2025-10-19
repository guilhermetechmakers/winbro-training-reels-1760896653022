import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User, LoginForm, SignupForm } from '@/types';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
};

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: () => api.get<User>('/auth/me'),
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!localStorage.getItem('auth_token'),
  });
};

// Sign in mutation
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginForm) => 
      api.post<{ user: User; token: string }>('/auth/login', credentials),
    onSuccess: (data) => {
      // Store auth token
      localStorage.setItem('auth_token', data.token);
      
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
};

// Sign up mutation
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: SignupForm) => 
      api.post<{ user: User; token: string; requiresVerification: boolean }>('/auth/signup', userData),
    onSuccess: (data) => {
      // Store auth token
      localStorage.setItem('auth_token', data.token);
      
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, data.user);
      
      // If email verification is required, redirect to verification page
      if (data.requiresVerification) {
        window.location.href = '/verify-email';
      }
    },
  });
};

// Sign out mutation
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/auth/logout', {}),
    onSuccess: () => {
      // Clear auth token
      localStorage.removeItem('auth_token');
      
      // Clear all cached data
      queryClient.clear();
    },
  });
};