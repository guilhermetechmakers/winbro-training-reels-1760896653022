/**
 * Authentication and user management types
 * Generated: 2024-12-20T14:00:00Z
 */

// =====================================================
// USER PROFILE TYPES
// =====================================================

export interface UserProfile {
  id: string;
  user_id: string;
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
// AUTHENTICATION TYPES
// =====================================================

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  role: string;
}

export interface User extends AuthUser {
  profile?: UserProfile;
  roles?: UserRole[];
  primary_role?: UserRole;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupForm {
  company: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTOS: boolean;
  acceptMarketing: boolean;
}

export interface PasswordResetRequestForm {
  email: string;
}

export interface PasswordResetForm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface EmailVerificationForm {
  token: string;
}

export interface ProfileUpdateForm {
  fullName: string;
  displayName?: string;
  bio?: string;
  company: string;
  department?: string;
  jobTitle?: string;
  phone?: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  themePreference: 'light' | 'dark' | 'system';
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    expires_in: number;
    token_type: string;
  };
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  expires_at?: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  user?: User;
}

// =====================================================
// PERMISSION TYPES
// =====================================================

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  [role: string]: Permission[];
}

// =====================================================
// ERROR TYPES
// =====================================================

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type UserRoleName = 'admin' | 'trainer' | 'learner' | 'moderator' | 'viewer';
export type UserScope = 'global' | 'organization' | 'department' | 'project';
export type ThemePreference = 'light' | 'dark' | 'system';
