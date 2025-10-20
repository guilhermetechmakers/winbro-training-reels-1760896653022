/**
 * Security Dashboard Component
 * Displays security metrics, events, and compliance status
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Users, 
  Activity,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { securityMonitoring } from '@/services/securityService';
import { complianceService } from '@/services/complianceService';
import type { SecurityMetrics, ComplianceMetrics } from '@/services/securityService';

interface SecurityDashboardProps {
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className }) => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metrics, compliance, events] = await Promise.all([
        securityMonitoring.getSecurityMetrics(),
        complianceService.getComplianceMetrics(),
        securityMonitoring.getRecentSecurityEvents(10)
      ]);

      setSecurityMetrics(metrics);
      setComplianceMetrics(compliance);
      setRecentEvents(events);
    } catch (err) {
      setError('Failed to load security dashboard data');
      console.error('Security dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-4 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button onClick={loadDashboardData} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security events, compliance status, and system health
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active user accounts
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics?.activeSessions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently logged in
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events (24h)</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics?.securityEvents24h || 0}</div>
              <p className="text-xs text-muted-foreground">
                {securityMetrics?.criticalEvents24h || 0} critical
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceMetrics?.complianceScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Overall security posture
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Failed Logins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-500" />
                  Failed Login Attempts (24h)
                </CardTitle>
                <CardDescription>
                  Recent authentication failures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {securityMetrics?.failedLogins24h || 0}
                </div>
                <div className="flex items-center mt-2">
                  {(securityMetrics?.failedLogins24h || 0) > 10 ? (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {(securityMetrics?.failedLogins24h || 0) > 10 ? 'High' : 'Normal'} activity
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Audit Logs (24h)
                </CardTitle>
                <CardDescription>
                  System activity tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {securityMetrics?.auditLogs24h || 0}
                </div>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-muted-foreground">
                    System activity recorded
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Latest security events and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.slice(0, 5).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(event.severity)}
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Detailed view of all security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getSeverityIcon(event.severity)}
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Type: {event.event_type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            IP: {event.ip_address || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>
                  Current compliance status and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Compliance</span>
                    <span>{complianceMetrics?.complianceScore || 0}%</span>
                  </div>
                  <Progress value={complianceMetrics?.complianceScore || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Data Retention</span>
                    <span>{complianceMetrics?.dataRetentionCompliance || 0}%</span>
                  </div>
                  <Progress value={complianceMetrics?.dataRetentionCompliance || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Access Control</span>
                    <span>{complianceMetrics?.accessControlCompliance || 0}%</span>
                  </div>
                  <Progress value={complianceMetrics?.accessControlCompliance || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Findings</CardTitle>
                <CardDescription>
                  Security findings requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Findings</span>
                    <Badge variant="outline">{complianceMetrics?.openFindings || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical Findings</span>
                    <Badge variant="destructive">{complianceMetrics?.criticalFindings || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Reports</span>
                    <Badge variant="secondary">{complianceMetrics?.totalReports || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Analysis</CardTitle>
              <CardDescription>
                Analysis of security threats and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Threat analysis features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};