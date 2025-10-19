/**
 * User session management types
 * Generated: 2024-12-20T15:00:00Z
 */

// =====================================================
// USER SESSION TYPES
// =====================================================

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: {
    browser?: string;
    os?: string;
    device?: string;
    platform?: string;
  };
  ip_address: string | null;
  user_agent: string | null;
  location: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
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
  ip_address?: string | null;
  user_agent?: string | null;
  location?: Record<string, any>;
  is_active?: boolean;
  last_activity?: string;
  expires_at: string;
}

export interface UserSessionUpdate {
  device_info?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  location?: Record<string, any>;
  is_active?: boolean;
  last_activity?: string;
  expires_at?: string;
}

// =====================================================
// PASSWORD MANAGEMENT TYPES
// =====================================================

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  code: string;
  backupCode?: string;
}

// =====================================================
// SUBSCRIPTION TYPES
// =====================================================

export interface SubscriptionInfo {
  id: string;
  user_id: string;
  plan_name: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  seats_allocated: number;
  seats_used: number;
  seats_available: number;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface SeatRequest {
  requested_seats: number;
  reason: string;
  manager_approval_required: boolean;
}

// =====================================================
// ACTIVITY LOG TYPES
// =====================================================

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ActivityLogFilter {
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface SessionListResponse {
  sessions: UserSession[];
  total: number;
  active_count: number;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
  requires_reauth?: boolean;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  setup: TwoFactorSetup;
  message: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  backup_codes?: string[];
  message: string;
}

export interface SubscriptionResponse {
  subscription: SubscriptionInfo;
  can_request_seats: boolean;
  max_seats_requestable: number;
}

export interface ActivityLogResponse {
  entries: ActivityLogEntry[];
  total: number;
  has_more: boolean;
}
