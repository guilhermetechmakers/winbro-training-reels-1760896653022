/**
 * Security Service for Winbro Training Reels
 * Handles audit logging, security monitoring, and compliance
 */

import { supabase } from '@/lib/supabase';
// import { SecurityService } from '@/lib/security';
// import type { Database } from '@/lib/supabase';

// Database types - these tables don't exist yet
type AuditLog = any;
type SecurityEvent = any;
// type UserSession = any;

export interface SecurityEventData {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogData {
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SecurityMetrics {
  totalUsers: number;
  activeSessions: number;
  failedLogins24h: number;
  securityEvents24h: number;
  criticalEvents24h: number;
  auditLogs24h: number;
}

export interface ComplianceMetrics {
  complianceScore: number;
  dataRetentionCompliance: number;
  accessControlCompliance: number;
  openFindings: number;
  criticalFindings: number;
  totalReports: number;
}

export class SecurityMonitoringService {
  private static instance: SecurityMonitoringService;
  private eventQueue: SecurityEventData[] = [];
  private auditQueue: AuditLogData[] = [];
  private isProcessing = false;

  private constructor() {
    // Start processing queues
    this.startQueueProcessing();
  }

  public static getInstance(): SecurityMonitoringService {
    if (!SecurityMonitoringService.instance) {
      SecurityMonitoringService.instance = new SecurityMonitoringService();
    }
    return SecurityMonitoringService.instance;
  }

  /**
   * Log security event
   */
  public async logSecurityEvent(
    userId: string | null,
    eventData: SecurityEventData,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_security_event', {
        p_user_id: userId,
        p_event_type: eventData.eventType,
        p_severity: eventData.severity,
        p_title: eventData.title,
        p_description: eventData.description || null,
        p_ip_address: requestInfo?.ipAddress || null,
        p_user_agent: requestInfo?.userAgent || null,
        p_metadata: eventData.metadata || {}
      });

      if (error) {
        console.error('Failed to log security event:', error);
        throw error;
      }

      // Send real-time alert for critical events
      if (eventData.severity === 'critical') {
        await this.sendCriticalAlert(eventData, userId);
      }

      return data;
    } catch (error) {
      console.error('Security event logging failed:', error);
      // Queue for retry
      this.eventQueue.push(eventData);
      throw error;
    }
  }

  /**
   * Log audit event
   */
  public async logAuditEvent(
    userId: string | null,
    auditData: AuditLogData,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_user_id: userId,
        p_action: auditData.action,
        p_resource_type: auditData.resourceType,
        p_resource_id: auditData.resourceId || null,
        p_old_values: auditData.oldValues || null,
        p_new_values: auditData.newValues || null,
        p_ip_address: requestInfo?.ipAddress || null,
        p_user_agent: requestInfo?.userAgent || null,
        p_severity: auditData.severity || 'info',
        p_category: auditData.category || 'general',
        p_description: auditData.description || null,
        p_metadata: auditData.metadata || {}
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Audit event logging failed:', error);
      // Queue for retry
      this.auditQueue.push(auditData);
      throw error;
    }
  }

  /**
   * Record user session
   */
  public async recordUserSession(
    userId: string,
    sessionId: string,
    requestInfo: {
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      locationCountry?: string;
      locationCity?: string;
    },
    expiresAt: Date
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_id: sessionId,
          ip_address: requestInfo.ipAddress,
          user_agent: requestInfo.userAgent,
          device_fingerprint: requestInfo.deviceFingerprint,
          location_country: requestInfo.locationCountry,
          location_city: requestInfo.locationCity,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Failed to record user session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Session recording failed:', error);
      throw error;
    }
  }

  /**
   * Update session activity
   */
  public async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('is_active', true);

      if (error) {
        console.error('Failed to update session activity:', error);
        throw error;
      }
    } catch (error) {
      console.error('Session activity update failed:', error);
      throw error;
    }
  }

  /**
   * End user session
   */
  public async endUserSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Failed to end user session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Session ending failed:', error);
      throw error;
    }
  }

  /**
   * Record failed login attempt
   */
  public async recordFailedLogin(
    email: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('record_failed_login', {
        p_email: email,
        p_ip_address: ipAddress,
        p_user_agent: userAgent || null
      });

      if (error) {
        console.error('Failed to record failed login:', error);
        throw error;
      }

      // Log security event
      await this.logSecurityEvent(null, {
        eventType: 'failed_login',
        severity: 'medium',
        title: 'Failed Login Attempt',
        description: `Failed login attempt for email: ${email}`,
        metadata: { email, ipAddress, userAgent }
      }, { ipAddress, userAgent });
    } catch (error) {
      console.error('Failed login recording failed:', error);
      throw error;
    }
  }

  /**
   * Clear failed login attempts
   */
  public async clearFailedLogins(email: string, ipAddress?: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('clear_failed_logins', {
        p_email: email,
        p_ip_address: ipAddress || null
      });

      if (error) {
        console.error('Failed to clear failed logins:', error);
        throw error;
      }
    } catch (error) {
      console.error('Clear failed logins failed:', error);
      throw error;
    }
  }

  /**
   * Check rate limiting
   */
  public async checkRateLimit(identifier: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier
      });

      if (error) {
        console.error('Failed to check rate limit:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }

  /**
   * Get security metrics
   */
  public async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active sessions
      const { count: activeSessions } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('expires_at', now.toISOString());

      // Get failed logins in last 24h
      const { count: failedLogins24h } = await supabase
        .from('failed_login_attempts')
        .select('*', { count: 'exact', head: true })
        .gt('last_attempt', yesterday.toISOString());

      // Get security events in last 24h
      const { count: securityEvents24h } = await supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', yesterday.toISOString());

      // Get critical events in last 24h
      const { count: criticalEvents24h } = await supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'critical')
        .gt('created_at', yesterday.toISOString());

      // Get audit logs in last 24h
      const { count: auditLogs24h } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', yesterday.toISOString());

      return {
        totalUsers: totalUsers || 0,
        activeSessions: activeSessions || 0,
        failedLogins24h: failedLogins24h || 0,
        securityEvents24h: securityEvents24h || 0,
        criticalEvents24h: criticalEvents24h || 0,
        auditLogs24h: auditLogs24h || 0
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      throw error;
    }
  }

  /**
   * Get recent security events
   */
  public async getRecentSecurityEvents(limit: number = 50): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get recent security events:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get recent security events failed:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for user
   */
  public async getUserAuditLogs(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { count: total, error: countError } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (logsError || countError) {
        console.error('Failed to get user audit logs:', logsError || countError);
        throw logsError || countError;
      }

      return {
        logs: logs || [],
        total: total || 0
      };
    } catch (error) {
      console.error('Get user audit logs failed:', error);
      throw error;
    }
  }

  /**
   * Send critical security alert
   */
  private async sendCriticalAlert(eventData: SecurityEventData, userId: string | null): Promise<void> {
    try {
      // In a real implementation, this would send alerts via:
      // - Email notifications
      // - Slack/Discord webhooks
      // - SMS alerts
      // - PagerDuty integration
      
      console.warn('🚨 CRITICAL SECURITY EVENT:', {
        event: eventData,
        userId,
        timestamp: new Date().toISOString()
      });

      // For now, we'll just log it
      // In production, implement actual alerting mechanisms
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  }

  /**
   * Start processing queued events
   */
  private startQueueProcessing(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    setInterval(async () => {
      await this.processEventQueue();
      await this.processAuditQueue();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process queued security events
   */
  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of events) {
      try {
        await this.logSecurityEvent(null, event);
      } catch (error) {
        console.error('Failed to process queued security event:', error);
        // Re-queue if failed
        this.eventQueue.push(event);
      }
    }
  }

  /**
   * Process queued audit events
   */
  private async processAuditQueue(): Promise<void> {
    if (this.auditQueue.length === 0) return;

    const audits = [...this.auditQueue];
    this.auditQueue = [];

    for (const audit of audits) {
      try {
        await this.logAuditEvent(null, audit);
      } catch (error) {
        console.error('Failed to process queued audit event:', error);
        // Re-queue if failed
        this.auditQueue.push(audit);
      }
    }
  }

  /**
   * Clean up expired sessions
   */
  public async cleanupExpiredSessions(): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .lt('expires_at', new Date().toISOString())
        .eq('is_active', true);

      if (error) {
        console.error('Failed to cleanup expired sessions:', error);
        throw error;
      }
    } catch (error) {
      console.error('Session cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get security dashboard data
   */
  public async getSecurityDashboard(): Promise<{
    metrics: SecurityMetrics;
    recentEvents: SecurityEvent[];
    topThreats: Array<{ eventType: string; count: number }>;
  }> {
    try {
      const [metrics, recentEvents] = await Promise.all([
        this.getSecurityMetrics(),
        this.getRecentSecurityEvents(20)
      ]);

      // Get top threats (event types with highest counts)
      const { data: threatData } = await supabase
        .from('security_events')
        .select('event_type')
        .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const threatCounts = (threatData || []).reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topThreats = Object.entries(threatCounts)
        .map(([eventType, count]) => ({ eventType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        metrics,
        recentEvents,
        topThreats
      };
    } catch (error) {
      console.error('Failed to get security dashboard:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const securityMonitoring = SecurityMonitoringService.getInstance();