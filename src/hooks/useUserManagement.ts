/**
 * React Query hooks for user management
 * Handles user roles, sessions, activity logging, and admin functions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserRoles,
  createUserRole,
  updateUserRole,
  deleteUserRole,
  getUserSessions,
  createUserSession,
  updateUserSession,
  revokeUserSession,
  revokeAllUserSessions,
  getUserActivityLog,
  logUserActivity,
  getAdminAuditLog,
  logAdminAction,
  getUserInvitations,
  createUserInvitation,
  updateUserInvitation,
  acceptUserInvitation,
  getSeatRequests,
  createSeatRequest,
  updateSeatRequest,
  getAdminDashboardStats,
  getUsers,
  updateUserProfileRole as updateUserRoleAPI,
  updateUserStatus,
  bulkUpdateUsers,
} from '@/api/userManagement';
import type {
  UserRoleUpdate,
  UserSessionUpdate,
  UserInvitationUpdate,
  SeatRequestUpdate,
} from '@/types/database/user-management';

// =====================================================
// USER ROLES HOOKS
// =====================================================

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: getUserRoles,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UserRoleUpdate }) =>
      updateUserRole(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });
};

export const useDeleteUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });
};

// =====================================================
// USER SESSIONS HOOKS
// =====================================================

export const useUserSessions = (userId: string) => {
  return useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: () => getUserSessions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateUserSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUserSession,
    onSuccess: (_, { user_id }) => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions', user_id] });
    },
  });
};

export const useUpdateUserSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UserSessionUpdate }) =>
      updateUserSession(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    },
  });
};

export const useRevokeUserSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: revokeUserSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    },
  });
};

export const useRevokeAllUserSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: revokeAllUserSessions,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions', userId] });
    },
  });
};

// =====================================================
// USER ACTIVITY LOG HOOKS
// =====================================================

export const useUserActivityLog = (userId: string, limit = 50) => {
  return useQuery({
    queryKey: ['user-activity-log', userId, limit],
    queryFn: () => getUserActivityLog(userId, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useLogUserActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logUserActivity,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-activity-log', variables.user_id] });
    },
  });
};

// =====================================================
// ADMIN AUDIT LOG HOOKS
// =====================================================

export const useAdminAuditLog = (limit = 100) => {
  return useQuery({
    queryKey: ['admin-audit-log', limit],
    queryFn: () => getAdminAuditLog(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useLogAdminAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logAdminAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
    },
  });
};

// =====================================================
// USER INVITATIONS HOOKS
// =====================================================

export const useUserInvitations = () => {
  return useQuery({
    queryKey: ['user-invitations'],
    queryFn: getUserInvitations,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateUserInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUserInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });
};

export const useUpdateUserInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UserInvitationUpdate }) =>
      updateUserInvitation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });
};

export const useAcceptUserInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: acceptUserInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });
};

// =====================================================
// SEAT REQUESTS HOOKS
// =====================================================

export const useSeatRequests = () => {
  return useQuery({
    queryKey: ['seat-requests'],
    queryFn: getSeatRequests,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateSeatRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSeatRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seat-requests'] });
    },
  });
};

export const useUpdateSeatRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SeatRequestUpdate }) =>
      updateSeatRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seat-requests'] });
    },
  });
};

// =====================================================
// ADMIN DASHBOARD HOOKS
// =====================================================

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getAdminDashboardStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

// =====================================================
// USER MANAGEMENT HOOKS
// =====================================================

export const useUsers = (filters?: {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useUpdateUserProfileRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      updateUserRoleAPI(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userIds, updates }: { userIds: string[]; updates: { role_id?: string; status?: string } }) =>
      bulkUpdateUsers(userIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// =====================================================
// ADMIN DATA REFRESH HOOK
// =====================================================

export const useAdminDataRefresh = () => {
  const queryClient = useQueryClient();
  
  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['users'] }),
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] }),
      queryClient.invalidateQueries({ queryKey: ['seat-requests'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] }),
    ]);
  };
  
  return { refreshAll };
};
