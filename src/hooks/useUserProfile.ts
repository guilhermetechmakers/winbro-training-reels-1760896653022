/**
 * Enhanced User Profile Management React Query hooks
 * Generated: 2024-12-20T15:00:00Z
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  getUserSessions,
  revokeSession,
  revokeAllOtherSessions,
  getUserSubscription,
  requestSeats,
  getActivityLog,
} from '@/api/userProfile';
import type {
  ActivityLogFilter,
} from '@/types/sessions';

// Query keys
export const userProfileKeys = {
  sessions: (userId: string) => ['user-profile', 'sessions', userId] as const,
  subscription: (userId: string) => ['user-profile', 'subscription', userId] as const,
  activityLog: (userId: string, filter?: ActivityLogFilter) => 
    ['user-profile', 'activity-log', userId, filter] as const,
};

// =====================================================
// PASSWORD MANAGEMENT HOOKS
// =====================================================

/**
 * Change password mutation
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

/**
 * Setup two-factor authentication mutation
 */
export const useSetupTwoFactor = () => {
  return useMutation({
    mutationFn: setupTwoFactor,
  });
};

/**
 * Verify two-factor authentication mutation
 */
export const useVerifyTwoFactor = () => {
  return useMutation({
    mutationFn: verifyTwoFactor,
  });
};

/**
 * Disable two-factor authentication mutation
 */
export const useDisableTwoFactor = () => {
  return useMutation({
    mutationFn: disableTwoFactor,
  });
};

// =====================================================
// SESSION MANAGEMENT HOOKS
// =====================================================

/**
 * Get user sessions
 */
export const useUserSessions = (userId: string) => {
  return useQuery({
    queryKey: userProfileKeys.sessions(userId),
    queryFn: () => getUserSessions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Revoke session mutation
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      // Invalidate sessions queries
      queryClient.invalidateQueries({ queryKey: ['user-profile', 'sessions'] });
    },
  });
};

/**
 * Revoke all other sessions mutation
 */
export const useRevokeAllOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAllOtherSessions,
    onSuccess: () => {
      // Invalidate sessions queries
      queryClient.invalidateQueries({ queryKey: ['user-profile', 'sessions'] });
    },
  });
};

// =====================================================
// SUBSCRIPTION MANAGEMENT HOOKS
// =====================================================

/**
 * Get user subscription
 */
export const useUserSubscription = (userId: string) => {
  return useQuery({
    queryKey: userProfileKeys.subscription(userId),
    queryFn: () => getUserSubscription(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Request seats mutation
 */
export const useRequestSeats = () => {
  return useMutation({
    mutationFn: requestSeats,
  });
};

// =====================================================
// ACTIVITY LOG HOOKS
// =====================================================

/**
 * Get user activity log
 */
export const useActivityLog = (userId: string, filter?: ActivityLogFilter) => {
  return useQuery({
    queryKey: userProfileKeys.activityLog(userId, filter),
    queryFn: () => getActivityLog(userId, filter),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
