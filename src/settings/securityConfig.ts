/**
 * Security Configuration for Winbro Training Reels
 * Centralized security settings and policies
 */

import { SECURITY_CONFIG } from '@/lib/security';

export interface SecurityPolicy {
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  rules: SecurityRule[];
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: 'alert' | 'block' | 'log' | 'notify';
  enabled: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  keyRotationDays: number;
  customerKeyPrefix: string;
}

export interface AuditConfig {
  enabled: boolean;
  retentionDays: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  sensitiveFields: string[];
  excludedActions: string[];
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  maxAttempts: number;
  lockoutDurationMs: number;
  whitelist: string[];
  blacklist: string[];
}

export interface SSOConfig {
  enabled: boolean;
  providers: string[];
  defaultProvider?: string;
  autoProvision: boolean;
  requireMFA: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  standards: string[];
  reportingInterval: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  retentionPolicies: DataRetentionPolicy[];
}

export interface DataRetentionPolicy {
  dataType: string;
  retentionDays: number;
  archiveAfterDays: number;
  deleteAfterDays: number;
  enabled: boolean;
}

export interface SecuritySettings {
  encryption: EncryptionConfig;
  audit: AuditConfig;
  rateLimit: RateLimitConfig;
  sso: SSOConfig;
  compliance: ComplianceConfig;
  policies: SecurityPolicy[];
}

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  encryption: {
    algorithm: SECURITY_CONFIG.ENCRYPTION_ALGORITHM,
    keyLength: SECURITY_CONFIG.KEY_LENGTH,
    ivLength: SECURITY_CONFIG.IV_LENGTH,
    tagLength: SECURITY_CONFIG.TAG_LENGTH,
    keyRotationDays: 90,
    customerKeyPrefix: 'winbro_customer_'
  },

  audit: {
    enabled: true,
    retentionDays: SECURITY_CONFIG.AUDIT_LOG_RETENTION_DAYS,
    logLevel: 'info',
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'ssn',
      'creditCard',
      'apiKey',
      'privateKey'
    ],
    excludedActions: [
      'session_heartbeat',
      'health_check',
      'metrics_collection'
    ]
  },

  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
    lockoutDurationMs: SECURITY_CONFIG.LOCKOUT_DURATION,
    whitelist: [],
    blacklist: []
  },

  sso: {
    enabled: true,
    providers: ['saml', 'oidc', 'oauth2'],
    defaultProvider: 'oidc',
    autoProvision: true,
    requireMFA: false
  },

  compliance: {
    enabled: true,
    standards: ['SOC2', 'GDPR', 'CCPA', 'HIPAA'],
    reportingInterval: 'monthly',
    retentionPolicies: [
      {
        dataType: 'audit_logs',
        retentionDays: 2555, // 7 years
        archiveAfterDays: 365, // 1 year
        deleteAfterDays: 2555, // 7 years
        enabled: true
      },
      {
        dataType: 'user_sessions',
        retentionDays: 90,
        archiveAfterDays: 30,
        deleteAfterDays: 90,
        enabled: true
      },
      {
        dataType: 'failed_login_attempts',
        retentionDays: 30,
        archiveAfterDays: 7,
        deleteAfterDays: 30,
        enabled: true
      },
      {
        dataType: 'security_events',
        retentionDays: 365,
        archiveAfterDays: 90,
        deleteAfterDays: 365,
        enabled: true
      },
      {
        dataType: 'user_data',
        retentionDays: 2555, // 7 years
        archiveAfterDays: 1095, // 3 years
        deleteAfterDays: 2555, // 7 years
        enabled: true
      }
    ]
  },

  policies: [
    {
      name: 'Password Policy',
      description: 'Enforce strong password requirements',
      enabled: true,
      severity: 'high',
      category: 'Authentication',
      rules: [
        {
          id: 'password_length',
          name: 'Minimum Password Length',
          description: 'Passwords must be at least 12 characters long',
          condition: 'password.length >= 12',
          action: 'block',
          enabled: true
        },
        {
          id: 'password_complexity',
          name: 'Password Complexity',
          description: 'Passwords must contain uppercase, lowercase, numbers, and symbols',
          condition: 'password.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]).+$/)',
          action: 'block',
          enabled: true
        }
      ]
    },
    {
      name: 'Session Management',
      description: 'Secure session handling and timeout policies',
      enabled: true,
      severity: 'medium',
      category: 'Session',
      rules: [
        {
          id: 'session_timeout',
          name: 'Session Timeout',
          description: 'Sessions must timeout after 24 hours of inactivity',
          condition: 'session.lastActivity < (now - 24h)',
          action: 'block',
          enabled: true
        },
        {
          id: 'concurrent_sessions',
          name: 'Concurrent Session Limit',
          description: 'Users can have maximum 5 concurrent sessions',
          condition: 'user.activeSessions > 5',
          action: 'block',
          enabled: true
        }
      ]
    },
    {
      name: 'Data Access Control',
      description: 'Control access to sensitive data and resources',
      enabled: true,
      severity: 'high',
      category: 'Access Control',
      rules: [
        {
          id: 'customer_data_isolation',
          name: 'Customer Data Isolation',
          description: 'Users can only access data from their own customer scope',
          condition: 'user.customerId !== resource.customerId',
          action: 'block',
          enabled: true
        },
        {
          id: 'admin_actions_audit',
          name: 'Admin Actions Audit',
          description: 'All administrative actions must be logged and audited',
          condition: 'action.category === "admin"',
          action: 'log',
          enabled: true
        }
      ]
    },
    {
      name: 'API Security',
      description: 'Secure API endpoints and rate limiting',
      enabled: true,
      severity: 'medium',
      category: 'API',
      rules: [
        {
          id: 'api_rate_limit',
          name: 'API Rate Limiting',
          description: 'API calls are limited to 1000 requests per hour per user',
          condition: 'api.requestsPerHour > 1000',
          action: 'block',
          enabled: true
        },
        {
          id: 'api_authentication',
          name: 'API Authentication Required',
          description: 'All API endpoints require valid authentication',
          condition: 'api.endpoint !== "/health" && !request.isAuthenticated',
          action: 'block',
          enabled: true
        }
      ]
    },
    {
      name: 'File Upload Security',
      description: 'Secure file upload and processing',
      enabled: true,
      severity: 'high',
      category: 'File Upload',
      rules: [
        {
          id: 'file_type_validation',
          name: 'File Type Validation',
          description: 'Only allowed file types can be uploaded',
          condition: 'file.type not in ["video/mp4", "video/webm", "video/quicktime"]',
          action: 'block',
          enabled: true
        },
        {
          id: 'file_size_limit',
          name: 'File Size Limit',
          description: 'Files must be smaller than 500MB',
          condition: 'file.size > 500MB',
          action: 'block',
          enabled: true
        },
        {
          id: 'malware_scan',
          name: 'Malware Scanning',
          description: 'All uploaded files must be scanned for malware',
          condition: 'file.scanStatus !== "clean"',
          action: 'block',
          enabled: true
        }
      ]
    },
    {
      name: 'Data Encryption',
      description: 'Ensure all sensitive data is encrypted',
      enabled: true,
      severity: 'critical',
      category: 'Encryption',
      rules: [
        {
          id: 'data_at_rest_encryption',
          name: 'Data at Rest Encryption',
          description: 'All data stored in database must be encrypted',
          condition: 'data.encrypted !== true',
          action: 'block',
          enabled: true
        },
        {
          id: 'data_in_transit_encryption',
          name: 'Data in Transit Encryption',
          description: 'All data transmission must use TLS 1.2 or higher',
          condition: 'connection.protocol !== "TLSv1.2" && connection.protocol !== "TLSv1.3"',
          action: 'block',
          enabled: true
        }
      ]
    }
  ]
};

/**
 * Security configuration manager
 */
export class SecurityConfigManager {
  private static instance: SecurityConfigManager;
  private settings: SecuritySettings;

  private constructor() {
    this.settings = { ...DEFAULT_SECURITY_SETTINGS };
    this.loadSettings();
  }

  public static getInstance(): SecurityConfigManager {
    if (!SecurityConfigManager.instance) {
      SecurityConfigManager.instance = new SecurityConfigManager();
    }
    return SecurityConfigManager.instance;
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const stored = localStorage.getItem('winbro_security_settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  }

  /**
   * Save settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      localStorage.setItem('winbro_security_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save security settings:', error);
    }
  }

  /**
   * Get current security settings
   */
  public getSettings(): SecuritySettings {
    return { ...this.settings };
  }

  /**
   * Update security settings
   */
  public async updateSettings(updates: Partial<SecuritySettings>): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await this.saveSettings();
  }

  /**
   * Get encryption configuration
   */
  public getEncryptionConfig(): EncryptionConfig {
    return { ...this.settings.encryption };
  }

  /**
   * Get audit configuration
   */
  public getAuditConfig(): AuditConfig {
    return { ...this.settings.audit };
  }

  /**
   * Get rate limit configuration
   */
  public getRateLimitConfig(): RateLimitConfig {
    return { ...this.settings.rateLimit };
  }

  /**
   * Get SSO configuration
   */
  public getSSOConfig(): SSOConfig {
    return { ...this.settings.sso };
  }

  /**
   * Get compliance configuration
   */
  public getComplianceConfig(): ComplianceConfig {
    return { ...this.settings.compliance };
  }

  /**
   * Get security policies
   */
  public getPolicies(): SecurityPolicy[] {
    return [...this.settings.policies];
  }

  /**
   * Get policies by category
   */
  public getPoliciesByCategory(category: string): SecurityPolicy[] {
    return this.settings.policies.filter(policy => policy.category === category);
  }

  /**
   * Get enabled policies
   */
  public getEnabledPolicies(): SecurityPolicy[] {
    return this.settings.policies.filter(policy => policy.enabled);
  }

  /**
   * Update policy
   */
  public async updatePolicy(policyName: string, updates: Partial<SecurityPolicy>): Promise<void> {
    const policyIndex = this.settings.policies.findIndex(p => p.name === policyName);
    if (policyIndex !== -1) {
      this.settings.policies[policyIndex] = { ...this.settings.policies[policyIndex], ...updates };
      await this.saveSettings();
    }
  }

  /**
   * Enable/disable policy
   */
  public async togglePolicy(policyName: string, enabled: boolean): Promise<void> {
    await this.updatePolicy(policyName, { enabled });
  }

  /**
   * Add new policy
   */
  public async addPolicy(policy: SecurityPolicy): Promise<void> {
    this.settings.policies.push(policy);
    await this.saveSettings();
  }

  /**
   * Remove policy
   */
  public async removePolicy(policyName: string): Promise<void> {
    this.settings.policies = this.settings.policies.filter(p => p.name !== policyName);
    await this.saveSettings();
  }

  /**
   * Validate security configuration
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate encryption config
    if (this.settings.encryption.keyLength < 256) {
      errors.push('Encryption key length must be at least 256 bits');
    }

    // Validate audit config
    if (this.settings.audit.retentionDays < 30) {
      errors.push('Audit retention period must be at least 30 days');
    }

    // Validate rate limit config
    if (this.settings.rateLimit.maxAttempts < 1) {
      errors.push('Rate limit max attempts must be at least 1');
    }

    // Validate policies
    for (const policy of this.settings.policies) {
      if (!policy.name || !policy.description) {
        errors.push(`Policy "${policy.name}" must have name and description`);
      }

      for (const rule of policy.rules) {
        if (!rule.id || !rule.name || !rule.condition) {
          errors.push(`Rule in policy "${policy.name}" must have id, name, and condition`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset to default settings
   */
  public async resetToDefaults(): Promise<void> {
    this.settings = { ...DEFAULT_SECURITY_SETTINGS };
    await this.saveSettings();
  }

  /**
   * Export security configuration
   */
  public exportConfiguration(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import security configuration
   */
  public async importConfiguration(configJson: string): Promise<{ success: boolean; errors: string[] }> {
    try {
      const imported = JSON.parse(configJson);
      const validation = this.validateConfiguration();
      
      if (validation.isValid) {
        this.settings = { ...this.settings, ...imported };
        await this.saveSettings();
        return { success: true, errors: [] };
      } else {
        return { success: false, errors: validation.errors };
      }
    } catch (error) {
      return { success: false, errors: ['Invalid JSON configuration'] };
    }
  }
}

// Export singleton instance
export const securityConfig = SecurityConfigManager.getInstance();