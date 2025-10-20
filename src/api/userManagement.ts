/**
 * User Management API endpoints
 * Handles user roles, sessions, activity logging, and admin functions
 */

import { supabase } from '@/lib/supabase';
import type {
  UserRole,
  UserRoleInsert,
  UserRoleUpdate,
  UserSession,
  UserSessionInsert,
  UserSessionUpdate,
  UserActivityLog,
  UserActivityLogInsert,
  AdminAuditLog,
  AdminAuditLogInsert,
  UserInvitation,
  UserInvitationInsert,
  UserInvitationUpdate,
  SeatRequest,
  SeatRequestInsert,
  SeatRequestUpdate,
} from '@/types/database/user-management';

// =====================================================
// USER ROLES API
// =====================================================

export const getUserRoles = async (): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('is_active', true)
    .order('role_name');

  if (error) throw error;
  return data || [];
};

export const createUserRole = async (role: UserRoleInsert): Promise<UserRole> => {
  const { data, error } = await supabase
    .from('user_roles')
    .insert(role)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserRole = async (id: string, updates: UserRoleUpdate): Promise<UserRole> => {
  const { data, error } = await supabase
    .from('user_roles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUserRole = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
};

// =====================================================
// USER SESSIONS API
// =====================================================

export const getUserSessions = async (userId: string): Promise<UserSession[]> => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_activity', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createUserSession = async (session: UserSessionInsert): Promise<UserSession> => {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserSession = async (id: string, updates: UserSessionUpdate): Promise<UserSession> => {
  const { data, error } = await supabase
    .from('user_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const revokeUserSession = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
};

export const revokeAllUserSessions = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .neq('is_active', false);

  if (error) throw error;
};

// =====================================================
// USER ACTIVITY LOG API
// =====================================================

export const getUserActivityLog = async (userId: string, limit = 50): Promise<UserActivityLog[]> => {
  const { data, error } = await supabase
    .from('user_activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const logUserActivity = async (activity: UserActivityLogInsert): Promise<UserActivityLog> => {
  const { data, error } = await supabase
    .from('user_activity_log')
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// ADMIN AUDIT LOG API
// =====================================================

export const getAdminAuditLog = async (limit = 100): Promise<AdminAuditLog[]> => {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const logAdminAction = async (action: AdminAuditLogInsert): Promise<AdminAuditLog> => {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .insert(action)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// USER INVITATIONS API
// =====================================================

export const getUserInvitations = async (): Promise<UserInvitation[]> => {
  const { data, error } = await supabase
    .from('user_invitations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createUserInvitation = async (invitation: UserInvitationInsert): Promise<UserInvitation> => {
  const { data, error } = await supabase
    .from('user_invitations')
    .insert(invitation)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserInvitation = async (id: string, updates: UserInvitationUpdate): Promise<UserInvitation> => {
  const { data, error } = await supabase
    .from('user_invitations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const acceptUserInvitation = async (token: string): Promise<UserInvitation> => {
  const { data, error } = await supabase
    .from('user_invitations')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('invitation_token', token)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// SEAT REQUESTS API
// =====================================================

export const getSeatRequests = async (): Promise<SeatRequest[]> => {
  const { data, error } = await supabase
    .from('seat_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createSeatRequest = async (request: SeatRequestInsert): Promise<SeatRequest> => {
  const { data, error } = await supabase
    .from('seat_requests')
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSeatRequest = async (id: string, updates: SeatRequestUpdate): Promise<SeatRequest> => {
  const { data, error } = await supabase
    .from('seat_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// ADMIN DASHBOARD STATS API
// =====================================================

export const getAdminDashboardStats = async () => {
  const [
    { data: usersData },
    { data: reelsData },
    { data: coursesData },
    { data: viewsData },
    { data: pendingApprovalsData },
    { data: recentActivityData }
  ] = await Promise.all([
    supabase.from('user_profiles').select('id, status').eq('status', 'active'),
    supabase.from('videos').select('id, status').eq('status', 'published'),
    supabase.from('courses').select('id, status').eq('status', 'published'),
    supabase.from('video_views').select('id').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('videos').select('id').eq('status', 'pending_approval'),
    supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(10)
  ]);

  return {
    overview: {
      total_users: usersData?.length || 0,
      active_users: usersData?.length || 0,
      total_customers: usersData?.length || 0,
      active_customers: usersData?.length || 0,
      total_reels: reelsData?.length || 0,
      published_reels: reelsData?.length || 0,
      total_courses: coursesData?.length || 0,
      monthly_views: viewsData?.length || 0,
      avg_completion_rate: 78,
      avg_session_duration: 1800
    },
    pending_approvals: pendingApprovalsData?.length || 0,
    recent_activity: recentActivityData || [],
    system_health: 99.8
  };
};

// =====================================================
// USER MANAGEMENT API
// =====================================================

export const getUsers = async (filters?: {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('user_profiles')
    .select(`
      *,
      primary_role:user_roles(role_name, display_name, is_admin)
    `);

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
  }

  if (filters?.role) {
    query = query.eq('primary_role_id', filters.role);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const updateUserProfileRole = async (userId: string, roleId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ primary_role_id: roleId })
    .eq('user_id', userId);

  if (error) throw error;
};

export const updateUserStatus = async (userId: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ status })
    .eq('user_id', userId);

  if (error) throw error;
};

export const bulkUpdateUsers = async (userIds: string[], updates: {
  role_id?: string;
  status?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .in('user_id', userIds);

  if (error) throw error;
};
