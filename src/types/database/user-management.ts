/**
 * Database types for user management tables
 * Generated: 2024-12-21T12:00:00Z
 * Enhanced: 2024-12-21T15:00:00Z
 */

// =====================================================
// ORGANIZATION TYPES
// =====================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  logo_url: string | null;
  settings: Record<string, any>;
  subscription_plan: string;
  subscription_status: string;
  max_seats: number;
  used_seats: number;
  trial_ends_at: string | null;
  billing_email: string | null;
  billing_address: Record<string, any> | null;
  status: 'active' | 'suspended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface OrganizationInsert {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  domain?: string | null;
  logo_url?: string | null;
  settings?: Record<string, any>;
  subscription_plan?: string;
  subscription_status?: string;
  max_seats?: number;
  used_seats?: number;
  trial_ends_at?: string | null;
  billing_email?: string | null;
  billing_address?: Record<string, any> | null;
  status?: 'active' | 'suspended' | 'cancelled';
}

export interface OrganizationUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  domain?: string | null;
  logo_url?: string | null;
  settings?: Record<string, any>;
  subscription_plan?: string;
  subscription_status?: string;
  max_seats?: number;
  used_seats?: number;
  trial_ends_at?: string | null;
  billing_email?: string | null;
  billing_address?: Record<string, any> | null;
  status?: 'active' | 'suspended' | 'cancelled';
}

// =====================================================
// USER PROFILE TYPES
// =====================================================

export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string | null;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string;
  department: string | null;
  job_title: string | null;
  employee_id: string | null;
  phone: string | null;
  timezone: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  backup_codes: string[] | null;
  last_password_change: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  profile_completed: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface UserProfileInsert {
  id?: string;
  user_id: string;
  organization_id?: string | null;
  full_name: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  company: string;
  department?: string | null;
  job_title?: string | null;
  employee_id?: string | null;
  phone?: string | null;
  timezone?: string;
  language?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_emails?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
  backup_codes?: string[] | null;
  last_password_change?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  profile_completed?: boolean;
  status?: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  metadata?: Record<string, any>;
}

export interface UserProfileUpdate {
  full_name?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  company?: string;
  department?: string | null;
  job_title?: string | null;
  employee_id?: string | null;
  phone?: string | null;
  timezone?: string;
  language?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_emails?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
  backup_codes?: string[] | null;
  last_password_change?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  profile_completed?: boolean;
  status?: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  metadata?: Record<string, any>;
}

// =====================================================
// USER ROLE TYPES
// =====================================================

export interface UserRole {
  id: string;
  user_id: string;
  organization_id: string | null;
  role_name: 'admin' | 'trainer' | 'learner' | 'moderator' | 'viewer';
  scope: 'global' | 'organization' | 'department' | 'project';
  scope_id: string | null;
  permissions: Record<string, any>;
  assigned_by: string | null;
  assigned_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleInsert {
  id?: string;
  user_id: string;
  organization_id?: string | null;
  role_name: 'admin' | 'trainer' | 'learner' | 'moderator' | 'viewer';
  scope?: 'global' | 'organization' | 'department' | 'project';
  scope_id?: string | null;
  permissions?: Record<string, any>;
  assigned_by?: string | null;
  assigned_at?: string;
  expires_at?: string | null;
  is_active?: boolean;
}

export interface UserRoleUpdate {
  role_name?: 'admin' | 'trainer' | 'learner' | 'moderator' | 'viewer';
  scope?: 'global' | 'organization' | 'department' | 'project';
  scope_id?: string | null;
  permissions?: Record<string, any>;
  assigned_by?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

// =====================================================
// USER SESSION TYPES
// =====================================================

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: Record<string, any>;
  device_name: string | null;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null;
  os_name: string | null;
  os_version: string | null;
  browser_name: string | null;
  browser_version: string | null;
  location: Record<string, any>;
  country: string | null;
  region: string | null;
  city: string | null;
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
  device_name?: string | null;
  device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null;
  os_name?: string | null;
  os_version?: string | null;
  browser_name?: string | null;
  browser_version?: string | null;
  location?: Record<string, any>;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  is_active?: boolean;
  last_activity?: string;
  expires_at: string;
}

export interface UserSessionUpdate {
  device_info?: Record<string, any>;
  device_name?: string | null;
  device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null;
  os_name?: string | null;
  os_version?: string | null;
  browser_name?: string | null;
  browser_version?: string | null;
  location?: Record<string, any>;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  is_active?: boolean;
  last_activity?: string;
  expires_at?: string;
}

// =====================================================
// ACTIVITY LOG TYPES
// =====================================================

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
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
  session_id?: string | null;
}

// =====================================================
// AUDIT LOG TYPES
// =====================================================

export interface AdminAuditLog {
  id: string;
  admin_user_id: string | null;
  action_type: string;
  action_description: string;
  target_user_id: string | null;
  target_resource_type: string | null;
  target_resource_id: string | null;
  changes: Record<string, any>;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
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
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
}

// =====================================================
// INVITATION TYPES
// =====================================================

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

// =====================================================
// SEAT REQUEST TYPES
// =====================================================

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

// =====================================================
// SSO PROVIDER TYPES
// =====================================================

export interface SSOProvider {
  id: string;
  organization_id: string;
  provider_name: 'google' | 'microsoft' | 'okta' | 'auth0' | 'saml' | 'ldap';
  provider_type: 'oauth2' | 'oidc' | 'saml' | 'ldap';
  display_name: string;
  description: string | null;
  config: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SSOProviderInsert {
  id?: string;
  organization_id: string;
  provider_name: 'google' | 'microsoft' | 'okta' | 'auth0' | 'saml' | 'ldap';
  provider_type: 'oauth2' | 'oidc' | 'saml' | 'ldap';
  display_name: string;
  description?: string | null;
  config?: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
}

export interface SSOProviderUpdate {
  provider_name?: 'google' | 'microsoft' | 'okta' | 'auth0' | 'saml' | 'ldap';
  provider_type?: 'oauth2' | 'oidc' | 'saml' | 'ldap';
  display_name?: string;
  description?: string | null;
  config?: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
}

// =====================================================
// SECURITY EVENT TYPES
// =====================================================

export interface SecurityEvent {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  event_data: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  location: Record<string, any>;
  session_id: string | null;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface SecurityEventInsert {
  id?: string;
  user_id?: string | null;
  organization_id?: string | null;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  event_data?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  location?: Record<string, any>;
  session_id?: string | null;
  resolved?: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
}

export interface SecurityEventUpdate {
  event_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  event_data?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  location?: Record<string, any>;
  session_id?: string | null;
  resolved?: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
}

// =====================================================
// ORGANIZATION MEMBER TYPES
// =====================================================

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  joined_at: string;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberInsert {
  id?: string;
  organization_id: string;
  user_id: string;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  joined_at?: string;
  invited_by?: string | null;
}

export interface OrganizationMemberUpdate {
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  joined_at?: string;
  invited_by?: string | null;
}

// =====================================================
// PASSWORD RESET TOKEN TYPES
// =====================================================

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  used_ip: string | null;
  used_user_agent: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface PasswordResetTokenInsert {
  id?: string;
  user_id: string;
  token: string;
  token_hash: string;
  expires_at: string;
  used_at?: string | null;
  used_ip?: string | null;
  used_user_agent?: string | null;
  attempts?: number;
  max_attempts?: number;
}

export interface PasswordResetTokenUpdate {
  token?: string;
  token_hash?: string;
  expires_at?: string;
  used_at?: string | null;
  used_ip?: string | null;
  used_user_agent?: string | null;
  attempts?: number;
  max_attempts?: number;
}

// =====================================================
// EMAIL VERIFICATION TOKEN TYPES
// =====================================================

export interface EmailVerificationToken {
  id: string;
  user_id: string;
  token: string;
  token_hash: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  used_ip: string | null;
  used_user_agent: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface EmailVerificationTokenInsert {
  id?: string;
  user_id: string;
  token: string;
  token_hash: string;
  email: string;
  expires_at: string;
  used_at?: string | null;
  used_ip?: string | null;
  used_user_agent?: string | null;
  attempts?: number;
  max_attempts?: number;
}

export interface EmailVerificationTokenUpdate {
  token?: string;
  token_hash?: string;
  email?: string;
  expires_at?: string;
  used_at?: string | null;
  used_ip?: string | null;
  used_user_agent?: string | null;
  attempts?: number;
  max_attempts?: number;
}

// =====================================================
// SUPABASE QUERY RESULT TYPES
// =====================================================

export type OrganizationRow = Organization;
export type UserProfileRow = UserProfile;
export type UserRoleRow = UserRole;
export type UserSessionRow = UserSession;
export type UserActivityLogRow = UserActivityLog;
export type AdminAuditLogRow = AdminAuditLog;
export type UserInvitationRow = UserInvitation;
export type SeatRequestRow = SeatRequest;
export type SSOProviderRow = SSOProvider;
export type SecurityEventRow = SecurityEvent;
export type OrganizationMemberRow = OrganizationMember;
export type PasswordResetTokenRow = PasswordResetToken;
export type EmailVerificationTokenRow = EmailVerificationToken;
