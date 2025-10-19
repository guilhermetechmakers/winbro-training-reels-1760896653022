/**
 * Enhanced User Profile Management API functions
 * Generated: 2024-12-20T15:00:00Z
 */

import { supabase } from '@/lib/supabase';
import type {
  ChangePasswordForm,
  TwoFactorSetup,
  TwoFactorVerification,
  SubscriptionInfo,
  SeatRequest,
  ActivityLogEntry,
  ActivityLogFilter,
  SessionListResponse,
  PasswordChangeResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyResponse,
  SubscriptionResponse,
  ActivityLogResponse,
} from '@/types/sessions';

// =====================================================
// PASSWORD MANAGEMENT FUNCTIONS
// =====================================================

/**
 * Change user password
 */
export async function changePassword(passwordData: ChangePasswordForm): Promise<PasswordChangeResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Password changed successfully',
      requires_reauth: true,
    };
  } catch (error) {
    console.error('Change password error:', error);
    throw new Error(error instanceof Error ? error.message : 'Password change failed');
  }
}

/**
 * Setup two-factor authentication
 */
export async function setupTwoFactor(): Promise<TwoFactorSetupResponse> {
  try {
    // This would typically integrate with a 2FA service like Authy or Google Authenticator
    // For now, we'll return mock data
    const mockSetup: TwoFactorSetup = {
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      backupCodes: ['12345678', '87654321', '11223344', '44332211', '55667788'],
    };

    return {
      success: true,
      setup: mockSetup,
      message: 'Two-factor authentication setup initiated',
    };
  } catch (error) {
    console.error('Setup 2FA error:', error);
    throw new Error(error instanceof Error ? error.message : '2FA setup failed');
  }
}

/**
 * Verify two-factor authentication setup
 */
export async function verifyTwoFactor(verification: TwoFactorVerification): Promise<TwoFactorVerifyResponse> {
  try {
    // This would typically verify the TOTP code with the 2FA service
    // For now, we'll simulate verification
    const isValid = verification.code === '123456' || verification.backupCode === '12345678';

    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    return {
      success: true,
      backup_codes: ['12345678', '87654321', '11223344', '44332211', '55667788'],
      message: 'Two-factor authentication enabled successfully',
    };
  } catch (error) {
    console.error('Verify 2FA error:', error);
    throw new Error(error instanceof Error ? error.message : '2FA verification failed');
  }
}

/**
 * Disable two-factor authentication
 */
export async function disableTwoFactor(): Promise<{ success: boolean; message: string }> {
  try {
    // This would typically disable 2FA in the auth service
    return {
      success: true,
      message: 'Two-factor authentication disabled successfully',
    };
  } catch (error) {
    console.error('Disable 2FA error:', error);
    throw new Error(error instanceof Error ? error.message : '2FA disable failed');
  }
}

// =====================================================
// SESSION MANAGEMENT FUNCTIONS
// =====================================================

/**
 * Get user sessions
 */
export async function getUserSessions(userId: string): Promise<SessionListResponse> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const sessions = data || [];
    const activeCount = sessions.filter(session => session.is_active).length;

    return {
      sessions,
      total: sessions.length,
      active_count: activeCount,
    };
  } catch (error) {
    console.error('Get user sessions error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get user sessions');
  }
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Revoke session error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to revoke session');
  }
}

/**
 * Revoke all other sessions (except current)
 */
export async function revokeAllOtherSessions(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current session token (this would need to be passed from the client)
    const currentSession = await supabase.auth.getSession();
    const currentToken = currentSession.data.session?.access_token;

    if (!currentToken) {
      throw new Error('Current session not found');
    }

    // Revoke all sessions except current
    const { error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .neq('session_token', currentToken);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Revoke all other sessions error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to revoke other sessions');
  }
}

// =====================================================
// SUBSCRIPTION MANAGEMENT FUNCTIONS
// =====================================================

/**
 * Get user subscription information
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionResponse> {
  try {
    // This would typically fetch from a subscriptions table or billing service
    // For now, we'll return mock data
    const mockSubscription: SubscriptionInfo = {
      id: 'sub_123456789',
      user_id: userId,
      plan_name: 'Professional',
      status: 'active',
      seats_allocated: 10,
      seats_used: 3,
      seats_available: 7,
      billing_cycle: 'monthly',
      current_period_start: '2024-12-01T00:00:00Z',
      current_period_end: '2025-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-12-20T15:00:00Z',
    };

    return {
      subscription: mockSubscription,
      can_request_seats: true,
      max_seats_requestable: 50,
    };
  } catch (error) {
    console.error('Get user subscription error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get subscription info');
  }
}

/**
 * Request additional seats
 */
export async function requestSeats(_request: SeatRequest): Promise<{ success: boolean; message: string }> {
  try {
    // This would typically create a seat request in the database
    // and notify administrators
    return {
      success: true,
      message: 'Seat request submitted successfully. You will be notified when approved.',
    };
  } catch (error) {
    console.error('Request seats error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to request seats');
  }
}

// =====================================================
// ACTIVITY LOG FUNCTIONS
// =====================================================

/**
 * Get user activity log
 */
export async function getActivityLog(userId: string, _filter?: ActivityLogFilter): Promise<ActivityLogResponse> {
  try {
    // This would typically fetch from an activity_logs table
    // For now, we'll return mock data
    const mockEntries: ActivityLogEntry[] = [
      {
        id: '1',
        user_id: userId,
        action: 'login',
        resource_type: 'auth',
        resource_id: null,
        details: { method: 'password', ip: '192.168.1.1' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-12-20T14:30:00Z',
      },
      {
        id: '2',
        user_id: userId,
        action: 'video_view',
        resource_type: 'video',
        resource_id: 'video_123',
        details: { video_title: 'Machine Setup Guide', duration: 25 },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-12-20T14:25:00Z',
      },
      {
        id: '3',
        user_id: userId,
        action: 'profile_update',
        resource_type: 'profile',
        resource_id: userId,
        details: { fields_updated: ['display_name', 'timezone'] },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-12-20T14:20:00Z',
      },
    ];

    return {
      entries: mockEntries,
      total: mockEntries.length,
      has_more: false,
    };
  } catch (error) {
    console.error('Get activity log error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get activity log');
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get device information from user agent
 */
export function getDeviceInfo(userAgent: string): Record<string, any> {
  // Simple device detection (in production, use a proper library like ua-parser-js)
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !isChrome;
  const isWindows = /Windows/.test(userAgent);
  const isMac = /Mac/.test(userAgent);
  const isLinux = /Linux/.test(userAgent);

  return {
    browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Unknown',
    os: isWindows ? 'Windows' : isMac ? 'macOS' : isLinux ? 'Linux' : 'Unknown',
    device: isMobile ? 'Mobile' : 'Desktop',
    platform: isMobile ? 'Mobile' : 'Desktop',
  };
}

/**
 * Format session location
 */
export function formatLocation(location: Record<string, any>): string {
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  if (location.country) parts.push(location.country);
  return parts.join(', ') || 'Unknown location';
}

/**
 * Format last activity time
 */
export function formatLastActivity(lastActivity: string): string {
  const now = new Date();
  const activity = new Date(lastActivity);
  const diffMs = now.getTime() - activity.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return activity.toLocaleDateString();
}
