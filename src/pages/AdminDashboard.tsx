/**
 * Admin Dashboard Page
 * Comprehensive administrative control center for content moderation, user & org management, subscriptions, and analytics
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw,
  Database,
  BarChart4,
  PieChart,
  CheckCircle,
  XCircle,
  Search,
  MoreHorizontal,
  UserPlus
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
// User Management Section Component
// =====================================================

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'trainer' | 'learner';
  status: 'active' | 'inactive' | 'pending';
  last_login: string;
  created_at: string;
  organization: string;
}

function UserManagementSection({ loading }: { loading?: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data for demonstration
  const users: User[] = [
    {
      id: '1',
      email: 'john.doe@company.com',
      name: 'John Doe',
      role: 'admin',
      status: 'active',
      last_login: '2024-12-20T10:30:00Z',
      created_at: '2024-01-15T09:00:00Z',
      organization: 'Acme Corp'
    },
    {
      id: '2',
      email: 'jane.smith@company.com',
      name: 'Jane Smith',
      role: 'trainer',
      status: 'active',
      last_login: '2024-12-19T14:20:00Z',
      created_at: '2024-02-10T11:30:00Z',
      organization: 'Acme Corp'
    },
    {
      id: '3',
      email: 'bob.wilson@company.com',
      name: 'Bob Wilson',
      role: 'learner',
      status: 'pending',
      last_login: '',
      created_at: '2024-12-18T16:45:00Z',
      organization: 'Beta Inc'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-status-green text-white">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-status-gray text-white">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 text-white">Admin</Badge>;
      case 'trainer':
        return <Badge className="bg-blue-500 text-white">Trainer</Badge>;
      case 'learner':
        return <Badge className="bg-green-500 text-white">Learner</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{role}</Badge>;
    }
  };

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
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions ({filteredUsers.length} users)
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="btn-secondary"
              size="sm"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
            <Button className="btn-primary" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="trainer">Trainer</option>
                <option value="learner">Learner</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Last Login</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-primary-text">{user.name}</div>
                          <div className="text-sm text-secondary-text">{user.email}</div>
                          <div className="text-xs text-secondary-text">{user.organization}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-text">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="h-8">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="h-8">
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-text">{filteredUsers.length}</div>
              <div className="text-sm text-secondary-text">Total Users</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-status-green">
                {filteredUsers.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-secondary-text">Active</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">
                {filteredUsers.filter(u => u.role === 'trainer').length}
              </div>
              <div className="text-sm text-secondary-text">Trainers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">
                {filteredUsers.filter(u => u.status === 'pending').length}
              </div>
              <div className="text-sm text-secondary-text">Pending</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Content Moderation Section Component
// =====================================================

function ContentModerationSection({ loading }: { loading?: boolean }) {
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data for demonstration
  const pendingContent = [
    {
      id: '1',
      title: 'Machine Setup Tutorial',
      type: 'reel',
      duration: '00:02:30',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-12-20T09:00:00Z',
      status: 'pending',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: '2',
      title: 'Safety Procedures Course',
      type: 'course',
      duration: '00:15:45',
      uploadedBy: 'Jane Smith',
      uploadedAt: '2024-12-19T14:30:00Z',
      status: 'pending',
      thumbnail: '/api/placeholder/300/200'
    }
  ];

  const handleApprove = () => {
    toast.success('Content approved successfully');
  };

  const handleReject = () => {
    toast.error('Content rejected');
  };

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
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Content Moderation</CardTitle>
              <CardDescription>
                Review and approve pending content ({pendingContent.length} items)
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="btn-secondary"
              size="sm"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
            <Button className="btn-primary" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Queue
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Content Queue */}
          <div className="space-y-4">
            {pendingContent.map((content) => (
              <div key={content.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <Video className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-primary-text">{content.title}</div>
                  <div className="text-sm text-secondary-text">
                    {content.type === 'reel' ? 'Video Reel' : 'Course'} • {content.duration} • {content.uploadedBy}
                  </div>
                  <div className="text-xs text-secondary-text">
                    Uploaded {new Date(content.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleApprove}
                    size="sm"
                    className="bg-status-green hover:bg-status-green/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-text">{pendingContent.length}</div>
              <div className="text-sm text-secondary-text">Pending Review</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-status-green">12</div>
              <div className="text-sm text-secondary-text">Approved Today</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-500">3</div>
              <div className="text-sm text-secondary-text">Rejected Today</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Subscription Management Section Component
// =====================================================

function SubscriptionManagementSection({ loading }: { loading?: boolean }) {
  // Mock data for demonstration
  const subscriptions = [
    {
      id: '1',
      company: 'Acme Corp',
      plan: 'Professional',
      status: 'active',
      users: 25,
      maxUsers: 50,
      monthlyRevenue: 2500,
      nextBilling: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      company: 'Beta Inc',
      plan: 'Enterprise',
      status: 'trial',
      users: 8,
      maxUsers: 100,
      monthlyRevenue: 0,
      nextBilling: '2025-01-01T00:00:00Z'
    }
  ];

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
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Subscription Management</CardTitle>
              <CardDescription>
                Manage customer subscriptions and billing ({subscriptions.length} active)
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button className="btn-secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="btn-primary" size="sm">
              <Building2 className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Subscriptions Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Company</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Users</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Revenue</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Next Billing</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary-text">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-primary-text">{sub.company}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-500 text-white">{sub.plan}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={sub.status === 'active' ? 'bg-status-green text-white' : 'bg-yellow-500 text-white'}>
                          {sub.status === 'active' ? 'Active' : 'Trial'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-primary-text">
                          {sub.users} / {sub.maxUsers}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-accent-blue h-2 rounded-full" 
                            style={{ width: `${(sub.users / sub.maxUsers) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-primary-text">
                        ${sub.monthlyRevenue.toLocaleString()}/mo
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-text">
                        {new Date(sub.nextBilling).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="h-8">
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="h-8">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-text">${subscriptions.reduce((sum, sub) => sum + sub.monthlyRevenue, 0).toLocaleString()}</div>
              <div className="text-sm text-secondary-text">Monthly Revenue</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-status-green">{subscriptions.filter(s => s.status === 'active').length}</div>
              <div className="text-sm text-secondary-text">Active Subscriptions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{subscriptions.filter(s => s.status === 'trial').length}</div>
              <div className="text-sm text-secondary-text">Trial Customers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{subscriptions.reduce((sum, sub) => sum + sub.users, 0)}</div>
              <div className="text-sm text-secondary-text">Total Users</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Analytics Section Component
// =====================================================

function AnalyticsSection({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart4 className="h-5 w-5 text-accent-blue" />
            <span>User Growth</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-secondary-text">
            <div className="text-center">
              <BarChart4 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>User growth chart would be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-accent-blue" />
            <span>Content Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-secondary-text">
            <div className="text-center">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Content distribution chart would be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-accent-blue" />
            <span>Revenue Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-secondary-text">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Revenue trends chart would be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-accent-blue" />
            <span>System Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-secondary-text">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>System performance metrics would be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// System Settings Section Component
// =====================================================

function SystemSettingsSection({ loading }: { loading?: boolean }) {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    autoApproveContent: false,
    emailNotifications: true,
    analyticsEnabled: true,
    maxFileSize: 100,
    sessionTimeout: 480
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Setting updated successfully');
  };

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
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-accent-blue" />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-primary-text">Maintenance Mode</div>
              <div className="text-sm text-secondary-text">Enable maintenance mode for system updates</div>
            </div>
            <button
              onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-accent-blue' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-primary-text">Auto-approve Content</div>
              <div className="text-sm text-secondary-text">Automatically approve new content uploads</div>
            </div>
            <button
              onClick={() => handleSettingChange('autoApproveContent', !settings.autoApproveContent)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoApproveContent ? 'bg-accent-blue' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoApproveContent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-primary-text">Email Notifications</div>
              <div className="text-sm text-secondary-text">Send email notifications to users</div>
            </div>
            <button
              onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-accent-blue' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-accent-blue" />
            <span>System Limits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-primary-text">Analytics Collection</div>
              <div className="text-sm text-secondary-text">Collect usage analytics and metrics</div>
            </div>
            <button
              onClick={() => handleSettingChange('analyticsEnabled', !settings.analyticsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.analyticsEnabled ? 'bg-accent-blue' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.analyticsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// Main Admin Dashboard Component
// =====================================================

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Management Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  { label: 'Manage Users', onClick: () => setActiveTab('users'), variant: 'primary' },
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
                  { label: 'Moderation Queue', onClick: () => setActiveTab('content'), variant: 'primary' },
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
                  { label: 'Manage Subscriptions', onClick: () => setActiveTab('subscriptions'), variant: 'primary' },
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
                  { label: 'System Settings', onClick: () => setActiveTab('settings'), variant: 'primary' },
                  { label: 'Integrations', onClick: () => toast.info('Opening integrations...') }
                ]}
                loading={isLoading}
              />
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagementSection loading={isLoading} />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <ContentModerationSection loading={isLoading} />
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionManagementSection loading={isLoading} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsSection loading={isLoading} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SystemSettingsSection loading={isLoading} />
          </TabsContent>
        </Tabs>

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
                  <Button onClick={() => setActiveTab('analytics')} className="btn-primary">
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