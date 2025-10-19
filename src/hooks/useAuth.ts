import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  signInWithPassword, 
  signUpWithPassword, 
  signOut, 
  getCurrentUser,
  refreshSession,
  requestPasswordReset,
  updatePassword,
  sendEmailVerification,
  verifyEmail,
  updateUserProfile,
  getUserRoles,
  userHasRole,
  getUserSessions,
  revokeUserSession,
  isAuthenticated,
  onAuthStateChange
} from '@/api/auth';
import type { 
  User
} from '@/types/auth';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  userRoles: (userId: string) => ['auth', 'user-roles', userId] as const,
  userSessions: (userId: string) => ['auth', 'user-sessions', userId] as const,
};

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Sign in mutation
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: (data) => {
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
};

// Sign up mutation
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUpWithPassword,
    onSuccess: (data) => {
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
};

// Sign out mutation
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// Refresh session mutation
export const useRefreshSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshSession,
    onSuccess: (data) => {
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
};

// Password reset request mutation
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
};

// Update password mutation
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updatePassword,
  });
};

// Send email verification mutation
export const useSendEmailVerification = () => {
  return useMutation({
    mutationFn: sendEmailVerification,
  });
};

// Verify email mutation
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      if (data.user) {
        // Update the user in the cache
        queryClient.setQueryData(authKeys.user, data.user);
      }
    },
  });
};

// Update user profile mutation
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, (old: User | undefined) => {
        if (!old) return old;
        return {
          ...old,
          profile: data,
        };
      });
    },
  });
};

// Get user roles
export const useUserRoles = (userId: string) => {
  return useQuery({
    queryKey: authKeys.userRoles(userId),
    queryFn: () => getUserRoles(userId),
    enabled: !!userId,
  });
};

// Check if user has role
export const useUserHasRole = (userId: string, roleName: string) => {
  return useQuery({
    queryKey: ['auth', 'user-has-role', userId, roleName],
    queryFn: () => userHasRole(userId, roleName),
    enabled: !!userId && !!roleName,
  });
};

// Get user sessions
export const useUserSessions = (userId: string) => {
  return useQuery({
    queryKey: authKeys.userSessions(userId),
    queryFn: () => getUserSessions(userId),
    enabled: !!userId,
  });
};

// Revoke user session mutation
export const useRevokeUserSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeUserSession,
    onSuccess: () => {
      // Invalidate user sessions query
      queryClient.invalidateQueries({ queryKey: ['auth', 'user-sessions'] });
    },
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  return useQuery({
    queryKey: ['auth', 'is-authenticated'],
    queryFn: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Auth state change hook
export const useAuthStateChange = (callback: (event: string, session: any) => void) => {
  return onAuthStateChange(callback);
};

// Main auth hook that provides user and auth state
export const useAuth = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    // Enhanced authentication features
    isEmailVerified: user?.email_confirmed_at ? true : false,
    isProfileComplete: user?.profile?.profile_completed || false,
    has2FA: user?.profile?.two_factor_enabled || false,
    lastLogin: user?.last_sign_in_at,
    createdAt: user?.created_at,
  };
};