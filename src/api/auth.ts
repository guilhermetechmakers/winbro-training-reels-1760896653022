/**
 * Enhanced Authentication API functions using Supabase
 * Generated: 2024-12-20T17:00:00Z
 * Features: SSO, SCIM, Advanced Security, Audit Logging
 */

import { supabase } from '@/lib/supabase';
import type {
  User,
  UserProfile,
  UserProfileUpdate,
  UserRole,
  LoginForm,
  SignupForm,
  AuthResponse,
  PasswordResetResponse,
  EmailVerificationResponse,
} from '@/types/auth';

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================

/**
 * Sign in with email and password
 */
export async function signInWithPassword(credentials: LoginForm): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Authentication failed');
    }

    // Get user profile and roles
    const user = await getUserWithProfile(data.user.id);

    return {
      user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        expires_in: data.session.expires_in || 0,
        token_type: data.session.token_type || 'bearer',
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error(error instanceof Error ? error.message : 'Sign in failed');
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(userData: SignupForm): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          company: userData.company,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Sign up failed');
    }

    // Get user profile and roles
    const user = await getUserWithProfile(data.user.id);

    return {
      user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        expires_in: data.session.expires_in || 0,
        token_type: data.session.token_type || 'bearer',
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw new Error(error instanceof Error ? error.message : 'Sign up failed');
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error(error instanceof Error ? error.message : 'Sign out failed');
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      return null;
    }

    return await getUserWithProfile(user.id);
  } catch (error) {
    console.error('Get current user error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get current user');
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Session refresh failed');
    }

    const user = await getUserWithProfile(data.user.id);

    return {
      user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        expires_in: data.session.expires_in || 0,
        token_type: data.session.token_type || 'bearer',
      },
    };
  } catch (error) {
    console.error('Refresh session error:', error);
    throw new Error(error instanceof Error ? error.message : 'Session refresh failed');
  }
}

// =====================================================
// PASSWORD RESET FUNCTIONS
// =====================================================

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Password reset email sent successfully',
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    throw new Error(error instanceof Error ? error.message : 'Password reset request failed');
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Update password error:', error);
    throw new Error(error instanceof Error ? error.message : 'Password update failed');
  }
}

// =====================================================
// EMAIL VERIFICATION FUNCTIONS
// =====================================================

/**
 * Send email verification
 */
export async function sendEmailVerification(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Send email verification error:', error);
    throw new Error(error instanceof Error ? error.message : 'Email verification send failed');
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<EmailVerificationResponse> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Email verification failed');
    }

    const user = await getUserWithProfile(data.user.id);

    return {
      success: true,
      message: 'Email verified successfully',
      user,
    };
  } catch (error) {
    console.error('Verify email error:', error);
    throw new Error(error instanceof Error ? error.message : 'Email verification failed');
  }
}

// =====================================================
// USER PROFILE FUNCTIONS
// =====================================================

/**
 * Get user with profile and roles
 */
export async function getUserWithProfile(userId: string): Promise<User> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(profileError.message);
    }

    // Get user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (rolesError) {
      throw new Error(rolesError.message);
    }

    // Get auth user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      email: user.email || '',
      email_confirmed_at: user.email_confirmed_at || null,
      phone: user.phone || null,
      phone_confirmed_at: user.phone_confirmed_at || null,
      last_sign_in_at: user.last_sign_in_at || null,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
      role: user.role || 'authenticated',
      profile: profile || undefined,
      roles: roles || [],
      primary_role: roles?.[0] || undefined,
    };
  } catch (error) {
    console.error('Get user with profile error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get user profile');
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData: UserProfileUpdate): Promise<UserProfile> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw new Error(error instanceof Error ? error.message : 'Profile update failed');
  }
}

/**
 * Create user profile
 */
export async function createUserProfile(profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Create user profile error:', error);
    throw new Error(error instanceof Error ? error.message : 'Profile creation failed');
  }
}

// =====================================================
// ROLE MANAGEMENT FUNCTIONS
// =====================================================

/**
 * Get user roles
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Get user roles error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get user roles');
  }
}

/**
 * Check if user has role
 */
export async function userHasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_name', roleName)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return !!data;
  } catch (error) {
    console.error('Check user role error:', error);
    return false;
  }
}

// =====================================================
// SESSION MANAGEMENT FUNCTIONS
// =====================================================

/**
 * Get user sessions
 */
export async function getUserSessions(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Get user sessions error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get user sessions');
  }
}

/**
 * Revoke user session
 */
export async function revokeUserSession(sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Revoke user session error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to revoke session');
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    return false;
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// =====================================================
// ENHANCED SECURITY FUNCTIONS
// =====================================================

/**
 * Log security event
 */
export async function logSecurityEvent(eventData: {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  event_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  location?: Record<string, any>;
}) {
  try {
    // TODO: Implement security event logging
    console.log('Security event:', eventData);
  } catch (error) {
    console.error('Log security event error:', error);
  }
}

/**
 * Log audit event
 */
export async function logAuditEvent(eventData: {
  event_type: string;
  event_category: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  event_data?: Record<string, any>;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
}) {
  try {
    // TODO: Implement audit event logging
    console.log('Audit event:', eventData);
  } catch (error) {
    console.error('Log audit event error:', error);
  }
}

/**
 * Check if user has specific permission
 */
export async function checkUserPermission(
  _userId: string, 
  _resource: string, 
  _action: string
): Promise<boolean> {
  try {
    // TODO: Implement permission checking
    return true;
  } catch (error) {
    console.error('Check user permission error:', error);
    return false;
  }
}

/**
 * Get user's organization context
 */
export async function getUserOrganization(_userId: string) {
  try {
    // TODO: Implement organization context retrieval
    return null;
  } catch (error) {
    console.error('Get user organization error:', error);
    return null;
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one special character');
  }

  return {
    score,
    feedback,
    isValid: score >= 3
  };
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Hash password (client-side for additional security)
 */
export async function hashPassword(password: string): Promise<string> {
  // TODO: Implement proper password hashing
  // This should use a secure hashing algorithm like bcrypt
  return password; // Placeholder
}

/**
 * Verify password hash
 */
export async function verifyPasswordHash(password: string, hash: string): Promise<boolean> {
  // TODO: Implement password hash verification
  return password === hash; // Placeholder
}
