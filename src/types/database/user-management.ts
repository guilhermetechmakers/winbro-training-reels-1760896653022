/**
 * Database types for user management tables
 * Generated: 2024-12-21T12:00:00Z
 */

export interface UserRole {
  id: string;
  role_name: string;
  display_name: string;
  description: string | null;
  permissions: Record<string, any>;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleInsert {
  id?: string;
  role_name: string;
  display_name: string;
  description?: string | null;
  permissions?: Record<string, any>;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface UserRoleUpdate {
  role_name?: string;
  display_name?: string;
  description?: string | null;
  permissions?: Record<string, any>;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: Record<string, any>;
  location: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserSessionInsert {
  id?: string;
  user_id: string;
  session_token: string;
  device_info?: Record<string, any>;
  location?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  is_active?: boolean;
  last_activity?: string;
  expires_at: string;
}

export interface UserSessionUpdate {
  device_info?: Record<string, any>;
  location?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  is_active?: boolean;
  last_activity?: string;
  expires_at?: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface UserActivityLogInsert {
  id?: string;
  user_id: string;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  details?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string | null;
  action_type: string;
  action_description: string;
  target_user_id: string | null;
  target_resource_type: string | null;
  target_resource_id: string | null;
  changes: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminAuditLogInsert {
  id?: string;
  admin_user_id?: string | null;
  action_type: string;
  action_description: string;
  target_user_id?: string | null;
  target_resource_type?: string | null;
  target_resource_id?: string | null;
  changes?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface UserInvitation {
  id: string;
  email: string;
  invited_by: string;
  organization_id: string | null;
  role_id: string | null;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserInvitationInsert {
  id?: string;
  email: string;
  invited_by: string;
  organization_id?: string | null;
  role_id?: string | null;
  invitation_token: string;
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  accepted_at?: string | null;
}

export interface UserInvitationUpdate {
  email?: string;
  organization_id?: string | null;
  role_id?: string | null;
  invitation_token?: string;
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at?: string;
  accepted_at?: string | null;
}

export interface SeatRequest {
  id: string;
  user_id: string;
  organization_id: string | null;
  requested_seats: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeatRequestInsert {
  id?: string;
  user_id: string;
  organization_id?: string | null;
  requested_seats: number;
  reason: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by?: string | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
}

export interface SeatRequestUpdate {
  organization_id?: string | null;
  requested_seats?: number;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by?: string | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
}

// Supabase query result types
export type UserRoleRow = UserRole;
export type UserSessionRow = UserSession;
export type UserActivityLogRow = UserActivityLog;
export type AdminAuditLogRow = AdminAuditLog;
export type UserInvitationRow = UserInvitation;
export type SeatRequestRow = SeatRequest;
