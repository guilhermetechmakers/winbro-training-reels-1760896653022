/**
 * Admin Dashboard Page
 * Comprehensive administrative control center for content moderation, user & org management, subscriptions, and analytics
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Video, 
  BookOpen, 
  TrendingUp, 
  Building2, 
  Eye, 
  Clock, 
  AlertTriangle,
  Settings,
  BarChart3,
  FileText,
  Shield,
  DollarSign,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAdminDashboardStats, useAdminDataRefresh } from '@/hooks/useAdmin';
import { toast } from 'sonner';

// =====================================================
// Overview Cards Component
// =====================================================

interface OverviewCardProps {
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

function OverviewCard({ value, subtitle, icon, trend, loading }: OverviewCardProps) {
  if (loading) {
    return (
      <Card className="card card-hover">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
              {icon}
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-text">{value}</p>
              <p className="text-secondary-text text-sm">{subtitle}</p>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${
              trend.isPositive ? 'text-status-green' : 'text-red-500'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${
                trend.isPositive ? '' : 'rotate-180'
              }`} />
              {trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Management Section Component
// =====================================================

interface ManagementSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats: {
    primary: number;
    secondary: number;
    label: string;
  };
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  loading?: boolean;
}

function ManagementSection({ title, description, icon, stats, actions, loading }: ManagementSectionProps) {
  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-6 rounded" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-2xl font-bold text-primary-text">{stats.primary}</p>
              <p className="text-secondary-text text-sm">{stats.label}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-primary-text">{stats.secondary}</p>
              <p className="text-secondary-text text-sm">Additional</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                className={action.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
                size="sm"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Analytics Chart Component
// =====================================================

interface AnalyticsChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
}

function AnalyticsChart({ title, data, loading }: AnalyticsChartProps) {
  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-accent-blue" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-secondary-text">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-primary-text">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Main Admin Dashboard Component
// =====================================================

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: dashboardStats, isLoading, error } = useAdminDashboardStats();
  const { refreshAll } = useAdminDataRefresh();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
      toast.success('Dashboard data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUserManagement = () => {
    toast.info('Navigating to User Management...');
    // Navigation would be handled by router
  };

  const handleContentModeration = () => {
    toast.info('Navigating to Content Moderation...');
    // Navigation would be handled by router
  };

  const handleSubscriptionManagement = () => {
    toast.info('Navigating to Subscription Management...');
    // Navigation would be handled by router
  };

  const handleAnalyticsReports = () => {
    toast.info('Navigating to Analytics & Reports...');
    // Navigation would be handled by router
  };

  const handleSystemSettings = () => {
    toast.info('Navigating to System Settings...');
    // Navigation would be handled by router
  };

  if (error) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Card className="card max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-text mb-2">Error Loading Dashboard</h3>
            <p className="text-secondary-text mb-4">
              There was an error loading the admin dashboard data.
            </p>
            <Button onClick={handleRefresh} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-text mb-2">Admin Dashboard</h1>
              <p className="text-secondary-text">Platform and customer administration</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            value={dashboardStats?.data?.overview?.active_customers || 0}
            subtitle="Total Customers"
            icon={<Building2 className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
            loading={isLoading}
          />
          <OverviewCard
            value={dashboardStats?.data?.overview?.total_reels || 0}
            subtitle="Published Reels"
            icon={<Video className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
            loading={isLoading}
          />
          <OverviewCard
            value={dashboardStats?.data?.overview?.total_courses || 0}
            subtitle="Active Courses"
            icon={<BookOpen className="h-6 w-6" />}
            trend={{ value: 15, isPositive: true }}
            loading={isLoading}
          />
          <OverviewCard
            value={dashboardStats?.data?.overview?.monthly_views || 0}
            subtitle="Total Views"
            icon={<Eye className="h-6 w-6" />}
            trend={{ value: 23, isPositive: true }}
            loading={isLoading}
          />
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ManagementSection
            title="User Management"
            description="Manage users, roles, invites and seat allocations"
            icon={<Users className="h-6 w-6" />}
            stats={{
              primary: dashboardStats?.data?.overview?.total_users || 0,
              secondary: dashboardStats?.data?.overview?.active_users || 0,
              label: 'Total Users'
            }}
            actions={[
              { label: 'Manage Users', onClick: handleUserManagement, variant: 'primary' },
              { label: 'View Roles', onClick: () => toast.info('Viewing user roles...') }
            ]}
            loading={isLoading}
          />

          <ManagementSection
            title="Library Management"
            description="Content approval queue, flagged reels, bulk operations"
            icon={<Video className="h-6 w-6" />}
            stats={{
              primary: dashboardStats?.data?.pending_approvals || 0,
              secondary: dashboardStats?.data?.overview?.published_reels || 0,
              label: 'Pending Approval'
            }}
            actions={[
              { label: 'Moderation Queue', onClick: handleContentModeration, variant: 'primary' },
              { label: 'Bulk Actions', onClick: () => toast.info('Opening bulk actions...') }
            ]}
            loading={isLoading}
          />

          <ManagementSection
            title="Subscription Management"
            description="Customer subscriptions, invoices, usage overages"
            icon={<DollarSign className="h-6 w-6" />}
            stats={{
              primary: dashboardStats?.data?.overview?.total_customers || 0,
              secondary: dashboardStats?.data?.overview?.active_customers || 0,
              label: 'Total Customers'
            }}
            actions={[
              { label: 'Manage Subscriptions', onClick: handleSubscriptionManagement, variant: 'primary' },
              { label: 'View Invoices', onClick: () => toast.info('Opening invoices...') }
            ]}
            loading={isLoading}
          />

          <ManagementSection
            title="System Settings"
            description="Integrations, storage, CDN, branding"
            icon={<Settings className="h-6 w-6" />}
            stats={{
              primary: Math.round(dashboardStats?.data?.system_health || 0),
              secondary: 100,
              label: 'System Health'
            }}
            actions={[
              { label: 'System Settings', onClick: handleSystemSettings, variant: 'primary' },
              { label: 'Integrations', onClick: () => toast.info('Opening integrations...') }
            ]}
            loading={isLoading}
          />
        </div>

        {/* Analytics & Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-accent-blue" />
                  <span>Analytics & Reports</span>
                </CardTitle>
                <CardDescription>
                  Engagement, search terms, support ticket deflections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-text">
                      {dashboardStats?.data?.overview?.avg_completion_rate || 0}%
                    </p>
                    <p className="text-secondary-text text-sm">Completion Rate</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-text">
                      {Math.round((dashboardStats?.data?.overview?.avg_session_duration || 0) / 60)}m
                    </p>
                    <p className="text-secondary-text text-sm">Avg Session</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleAnalyticsReports} className="btn-primary">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button onClick={() => toast.info('Generating report...')} className="btn-secondary">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <AnalyticsChart
              title="System Health"
              data={[
                { label: 'Uptime', value: 99.8, color: '#34D399' },
                { label: 'API Response', value: 245, color: '#2563EB' },
                { label: 'Storage Used', value: 2.4, color: '#F59E0B' },
              ]}
              loading={isLoading}
            />

            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-accent-blue" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => toast.info('Downloading user report...')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download User Report
                </Button>
                <Button 
                  onClick={() => toast.info('Generating content report...')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content Analytics
                </Button>
                <Button 
                  onClick={() => toast.info('Opening audit logs...')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  View Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-accent-blue" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest admin actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardStats?.data?.recent_activity?.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-full bg-accent-blue/10">
                      <Activity className="h-4 w-4 text-accent-blue" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-text">
                        {activity.action_description}
                      </p>
                      <p className="text-xs text-secondary-text">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xs text-secondary-text">
                      {activity.action_type}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-secondary-text">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}