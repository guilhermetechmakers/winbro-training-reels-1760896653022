/**
 * Compliance Service for Winbro Training Reels
 * Handles security compliance, reporting, and audit requirements
 */

import { supabase } from '@/lib/supabase';
// import { securityMonitoring } from './securityService';
// import type { Database } from '@/lib/supabase';

// Database types - these tables don't exist yet
type AuditLog = any;
type SecurityEvent = any;

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'security' | 'audit' | 'data_retention' | 'access_control';
  period: {
    start: string;
    end: string;
  };
  generatedAt: string;
  generatedBy: string;
  summary: {
    totalEvents: number;
    criticalEvents: number;
    highRiskEvents: number;
    complianceScore: number;
  };
  findings: ComplianceFinding[];
  recommendations: string[];
  status: 'draft' | 'final' | 'archived';
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  evidence: string[];
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  dueDate?: string;
  resolvedAt?: string;
}

export interface DataRetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataType: string;
  retentionPeriodDays: number;
  archiveAfterDays: number;
  deleteAfterDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceMetrics {
  totalReports: number;
  openFindings: number;
  criticalFindings: number;
  complianceScore: number;
  lastAuditDate: string | null;
  nextAuditDate: string | null;
  dataRetentionCompliance: number;
  accessControlCompliance: number;
}

export class ComplianceService {
  private static instance: ComplianceService;
  private dataRetentionPolicies: DataRetentionPolicy[] = [];

  private constructor() {
    this.loadDataRetentionPolicies();
  }

  public static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  /**
   * Load data retention policies
   */
  private async loadDataRetentionPolicies(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Failed to load data retention policies:', error);
        return;
      }

      this.dataRetentionPolicies = data || [];
    } catch (error) {
      console.error('Load data retention policies failed:', error);
    }
  }

  /**
   * Generate security compliance report
   */
  public async generateSecurityReport(
    startDate: string,
    endDate: string,
    generatedBy: string
  ): Promise<ComplianceReport> {
    try {
      const reportId = `SEC-${Date.now()}`;
      
      // Get security events in period
      const { data: securityEvents, error: eventsError } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (eventsError) {
        throw eventsError;
      }

      // Get audit logs in period
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (auditError) {
        throw auditError;
      }

      // Analyze findings
      const findings = await this.analyzeSecurityFindings(securityEvents || [], auditLogs || []);
      
      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(findings);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(findings);

      const report: ComplianceReport = {
        id: reportId,
        name: `Security Compliance Report - ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
        type: 'security',
        period: { start: startDate, end: endDate },
        generatedAt: new Date().toISOString(),
        generatedBy,
        summary: {
          totalEvents: (securityEvents?.length || 0) + (auditLogs?.length || 0),
          criticalEvents: findings.filter(f => f.severity === 'critical').length,
          highRiskEvents: findings.filter(f => f.severity === 'high').length,
          complianceScore
        },
        findings,
        recommendations,
        status: 'draft'
      };

      // Save report
      await this.saveComplianceReport(report);

      return report;
    } catch (error) {
      console.error('Generate security report failed:', error);
      throw error;
    }
  }

  /**
   * Generate audit compliance report
   */
  public async generateAuditReport(
    startDate: string,
    endDate: string,
    generatedBy: string
  ): Promise<ComplianceReport> {
    try {
      const reportId = `AUDIT-${Date.now()}`;
      
      // Get audit logs in period
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (auditError) {
        throw auditError;
      }

      // Analyze audit findings
      const findings = await this.analyzeAuditFindings(auditLogs || []);
      
      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(findings);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(findings);

      const report: ComplianceReport = {
        id: reportId,
        name: `Audit Compliance Report - ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
        type: 'audit',
        period: { start: startDate, end: endDate },
        generatedAt: new Date().toISOString(),
        generatedBy,
        summary: {
          totalEvents: auditLogs?.length || 0,
          criticalEvents: findings.filter(f => f.severity === 'critical').length,
          highRiskEvents: findings.filter(f => f.severity === 'high').length,
          complianceScore
        },
        findings,
        recommendations,
        status: 'draft'
      };

      // Save report
      await this.saveComplianceReport(report);

      return report;
    } catch (error) {
      console.error('Generate audit report failed:', error);
      throw error;
    }
  }

  /**
   * Generate data retention compliance report
   */
  public async generateDataRetentionReport(
    generatedBy: string
  ): Promise<ComplianceReport> {
    try {
      const reportId = `DR-${Date.now()}`;
      const now = new Date();
      const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      // Analyze data retention compliance
      const findings = await this.analyzeDataRetentionCompliance();
      
      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(findings);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(findings);

      const report: ComplianceReport = {
        id: reportId,
        name: `Data Retention Compliance Report - ${now.toLocaleDateString()}`,
        type: 'data_retention',
        period: { start: startDate, end: now.toISOString() },
        generatedAt: now.toISOString(),
        generatedBy,
        summary: {
          totalEvents: findings.length,
          criticalEvents: findings.filter(f => f.severity === 'critical').length,
          highRiskEvents: findings.filter(f => f.severity === 'high').length,
          complianceScore
        },
        findings,
        recommendations,
        status: 'draft'
      };

      // Save report
      await this.saveComplianceReport(report);

      return report;
    } catch (error) {
      console.error('Generate data retention report failed:', error);
      throw error;
    }
  }

  /**
   * Analyze security findings
   */
  private async analyzeSecurityFindings(
    securityEvents: SecurityEvent[],
    auditLogs: AuditLog[]
  ): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    // Analyze failed login attempts
    const failedLogins = securityEvents.filter(e => e.event_type === 'failed_login');
    if (failedLogins.length > 10) {
      findings.push({
        id: `finding-${Date.now()}-1`,
        severity: 'high',
        category: 'Authentication',
        title: 'Excessive Failed Login Attempts',
        description: `Detected ${failedLogins.length} failed login attempts in the reporting period`,
        evidence: failedLogins.map(e => `IP: ${e.ip_address}, Time: ${e.created_at}`),
        remediation: 'Implement account lockout policies and rate limiting',
        status: 'open'
      });
    }

    // Analyze critical security events
    const criticalEvents = securityEvents.filter(e => e.severity === 'critical');
    criticalEvents.forEach((event, index) => {
      findings.push({
        id: `finding-${Date.now()}-${index + 2}`,
        severity: 'critical',
        category: 'Security Incident',
        title: event.title,
        description: event.description || 'Critical security event detected',
        evidence: [event.metadata ? JSON.stringify(event.metadata) : 'No additional evidence'],
        remediation: 'Immediate investigation and remediation required',
        status: 'open'
      });
    });

    // Analyze privilege escalation attempts
    const privilegeEvents = auditLogs.filter(log => 
      log.action === 'user_manage_roles' || 
      log.action === 'user_update' && 
      log.new_values?.role !== log.old_values?.role
    );
    
    if (privilegeEvents.length > 0) {
      findings.push({
        id: `finding-${Date.now()}-${findings.length + 1}`,
        severity: 'medium',
        category: 'Access Control',
        title: 'Privilege Changes Detected',
        description: `${privilegeEvents.length} privilege changes detected in the reporting period`,
        evidence: privilegeEvents.map(e => `Action: ${e.action}, User: ${e.user_id}, Time: ${e.created_at}`),
        remediation: 'Review privilege changes for unauthorized access',
        status: 'open'
      });
    }

    return findings;
  }

  /**
   * Analyze audit findings
   */
  private async analyzeAuditFindings(auditLogs: AuditLog[]): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    // Analyze data access patterns
    const dataAccessLogs = auditLogs.filter(log => 
      log.resource_type === 'content' && log.action === 'read'
    );
    
    const userAccessCounts = dataAccessLogs.reduce((acc, log) => {
      acc[log.user_id || 'unknown'] = (acc[log.user_id || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const suspiciousUsers = Object.entries(userAccessCounts)
      .filter(([_, count]) => (count as number) > 1000)
      .map(([userId, count]) => ({ userId, count: count as number }));

    if (suspiciousUsers.length > 0) {
      findings.push({
        id: `finding-${Date.now()}-1`,
        severity: 'medium',
        category: 'Data Access',
        title: 'Unusual Data Access Patterns',
        description: 'Users with unusually high data access detected',
        evidence: suspiciousUsers.map(u => `User: ${u.userId}, Accesses: ${u.count}`),
        remediation: 'Review user access patterns and implement access controls',
        status: 'open'
      });
    }

    // Analyze administrative actions
    const adminActions = auditLogs.filter(log => 
      log.category === 'user_management' || 
      log.category === 'system_administration'
    );

    if (adminActions.length > 0) {
      findings.push({
        id: `finding-${Date.now()}-2`,
        severity: 'low',
        category: 'Administrative Actions',
        title: 'Administrative Actions Performed',
        description: `${adminActions.length} administrative actions performed in the reporting period`,
        evidence: adminActions.map(a => `Action: ${a.action}, User: ${a.user_id}, Time: ${a.created_at}`),
        remediation: 'Ensure all administrative actions are properly authorized',
        status: 'open'
      });
    }

    return findings;
  }

  /**
   * Analyze data retention compliance
   */
  private async analyzeDataRetentionCompliance(): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    for (const policy of this.dataRetentionPolicies) {
      try {
        // Check for data that should be archived
        // const archiveThreshold = new Date(Date.now() - policy.archiveAfterDays * 24 * 60 * 60 * 1000);
        
        // Check for data that should be deleted
        // const deleteThreshold = new Date(Date.now() - policy.deleteAfterDays * 24 * 60 * 60 * 1000);

        // This would need to be implemented based on specific data types
        // For now, we'll create a placeholder finding
        if (policy.deleteAfterDays < 2555) { // 7 years
          findings.push({
            id: `finding-${Date.now()}-${policy.id}`,
            severity: 'medium',
            category: 'Data Retention',
            title: `Data Retention Policy: ${policy.name}`,
            description: `Data retention policy requires review for ${policy.dataType}`,
            evidence: [`Policy: ${policy.name}`, `Retention Period: ${policy.retentionPeriodDays} days`],
            remediation: 'Review and implement data retention procedures',
            status: 'open'
          });
        }
      } catch (error) {
        console.error(`Failed to analyze data retention policy ${policy.id}:`, error);
      }
    }

    return findings;
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(findings: ComplianceFinding[]): number {
    if (findings.length === 0) return 100;

    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const mediumCount = findings.filter(f => f.severity === 'medium').length;
    const lowCount = findings.filter(f => f.severity === 'low').length;

    // Weighted scoring: critical = -20, high = -10, medium = -5, low = -2
    const score = Math.max(0, 100 - (criticalCount * 20) - (highCount * 10) - (mediumCount * 5) - (lowCount * 2));
    
    return Math.round(score);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations: string[] = [];

    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');
    const mediumFindings = findings.filter(f => f.severity === 'medium');

    if (criticalFindings.length > 0) {
      recommendations.push('Immediately address all critical findings');
    }

    if (highFindings.length > 0) {
      recommendations.push('Prioritize resolution of high-severity findings');
    }

    if (mediumFindings.length > 0) {
      recommendations.push('Schedule remediation for medium-severity findings');
    }

    if (findings.some(f => f.category === 'Authentication')) {
      recommendations.push('Implement multi-factor authentication');
      recommendations.push('Review and strengthen password policies');
    }

    if (findings.some(f => f.category === 'Access Control')) {
      recommendations.push('Implement principle of least privilege');
      recommendations.push('Regular access reviews and certifications');
    }

    if (findings.some(f => f.category === 'Data Retention')) {
      recommendations.push('Implement automated data retention policies');
      recommendations.push('Regular data lifecycle management reviews');
    }

    return recommendations;
  }

  /**
   * Save compliance report
   */
  private async saveComplianceReport(report: ComplianceReport): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_reports')
        .insert({
          id: report.id,
          name: report.name,
          type: report.type,
          period_start: report.period.start,
          period_end: report.period.end,
          generated_at: report.generatedAt,
          generated_by: report.generatedBy,
          summary: report.summary,
          findings: report.findings,
          recommendations: report.recommendations,
          status: report.status
        });

      if (error) {
        console.error('Failed to save compliance report:', error);
        throw error;
      }
    } catch (error) {
      console.error('Save compliance report failed:', error);
      throw error;
    }
  }

  /**
   * Get compliance metrics
   */
  public async getComplianceMetrics(): Promise<ComplianceMetrics> {
    try {
      // Get total reports
      const { count: totalReports } = await supabase
        .from('compliance_reports')
        .select('*', { count: 'exact', head: true });

      // Get open findings
      const { data: reports } = await supabase
        .from('compliance_reports')
        .select('findings')
        .eq('status', 'final');

      const allFindings = reports?.flatMap(r => r.findings || []) || [];
      const openFindings = allFindings.filter(f => f.status === 'open').length;
      const criticalFindings = allFindings.filter(f => f.severity === 'critical').length;

      // Calculate overall compliance score
      const complianceScore = this.calculateComplianceScore(allFindings);

      // Get last audit date
      const { data: lastReport } = await supabase
        .from('compliance_reports')
        .select('generated_at')
        .eq('type', 'audit')
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      // Calculate next audit date (quarterly)
      const nextAuditDate = lastReport 
        ? new Date(new Date(lastReport.generated_at).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Calculate data retention compliance
      const dataRetentionCompliance = this.calculateDataRetentionCompliance();

      // Calculate access control compliance
      const accessControlCompliance = this.calculateAccessControlCompliance();

      return {
        totalReports: totalReports || 0,
        openFindings,
        criticalFindings,
        complianceScore,
        lastAuditDate: lastReport?.generated_at || null,
        nextAuditDate,
        dataRetentionCompliance,
        accessControlCompliance
      };
    } catch (error) {
      console.error('Get compliance metrics failed:', error);
      throw error;
    }
  }

  /**
   * Calculate data retention compliance
   */
  private calculateDataRetentionCompliance(): number {
    // This would be implemented based on actual data retention policies
    // For now, return a placeholder value
    return 85;
  }

  /**
   * Calculate access control compliance
   */
  private calculateAccessControlCompliance(): number {
    // This would be implemented based on access control policies
    // For now, return a placeholder value
    return 90;
  }

  /**
   * Get compliance reports
   */
  public async getComplianceReports(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ reports: ComplianceReport[]; total: number }> {
    try {
      const { data: reports, error: reportsError } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { count: total, error: countError } = await supabase
        .from('compliance_reports')
        .select('*', { count: 'exact', head: true });

      if (reportsError || countError) {
        throw reportsError || countError;
      }

      return {
        reports: reports || [],
        total: total || 0
      };
    } catch (error) {
      console.error('Get compliance reports failed:', error);
      throw error;
    }
  }

  /**
   * Update finding status
   */
  public async updateFindingStatus(
    reportId: string,
    findingId: string,
    status: ComplianceFinding['status'],
    assignedTo?: string,
    dueDate?: string
  ): Promise<void> {
    try {
      // Get the report
      const { data: report, error: reportError } = await supabase
        .from('compliance_reports')
        .select('findings')
        .eq('id', reportId)
        .single();

      if (reportError) {
        throw reportError;
      }

      // Update the finding
      const findings = report.findings || [];
      const findingIndex = findings.findIndex((f: ComplianceFinding) => f.id === findingId);
      
      if (findingIndex === -1) {
        throw new Error('Finding not found');
      }

      findings[findingIndex] = {
        ...findings[findingIndex],
        status,
        assignedTo,
        dueDate,
        resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined
      };

      // Update the report
      const { error: updateError } = await supabase
        .from('compliance_reports')
        .update({ findings })
        .eq('id', reportId);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      console.error('Update finding status failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const complianceService = ComplianceService.getInstance();