/**
 * Admin Analytics Charts Component
 * Advanced data visualization for admin dashboard using Recharts
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Video, 
  Activity,
  PieChart as PieChartIcon,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// =====================================================
// Chart Data Types
// =====================================================

interface ChartDataPoint {
  date: string;
  value?: number;
  label?: string;
  [key: string]: any;
}

interface ChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  title: string;
  description?: string;
  height?: number;
}

// =====================================================
// Color Palette
// =====================================================

const COLORS = {
  primary: '#2563EB',
  secondary: '#6B7280',
  success: '#34D399',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.error,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
  COLORS.indigo,
  COLORS.teal,
];

// =====================================================
// User Growth Chart
// =====================================================

export function UserGrowthChart({ data, loading, title, description, height = 300 }: ChartProps) {
  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-accent-blue" />
            <CardTitle>{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-accent-blue" />
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#111827', fontWeight: '600' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS.primary}
              fill="url(#userGrowthGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Content Uploads Chart
// =====================================================

export function ContentUploadsChart({ data, loading, title, description, height = 300 }: ChartProps) {
  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-accent-blue" />
            <CardTitle>{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Video className="h-5 w-5 text-accent-blue" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#111827', fontWeight: '600' }}
            />
            <Bar 
              dataKey="value" 
              fill={COLORS.success}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Engagement Trends Chart
// =====================================================

export function EngagementTrendsChart({ data, loading, title, description, height = 300 }: ChartProps) {
  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-accent-blue" />
            <CardTitle>{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-accent-blue" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#111827', fontWeight: '600' }}
            />
            <Legend />
            <Bar dataKey="views" fill={COLORS.primary} name="Views" />
            <Bar dataKey="completions" fill={COLORS.success} name="Completions" />
            <Line 
              type="monotone" 
              dataKey="engagement_rate" 
              stroke={COLORS.warning} 
              strokeWidth={3}
              name="Engagement Rate %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Content Distribution Pie Chart
// =====================================================

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  loading?: boolean;
  title: string;
  description?: string;
  height?: number;
}

export function ContentDistributionChart({ data, loading, title, description, height = 300 }: PieChartProps) {
  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5 text-accent-blue" />
            <CardTitle>{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <PieChartIcon className="h-5 w-5 text-accent-blue" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// =====================================================
// System Performance Chart
// =====================================================

export function SystemPerformanceChart({ data, loading, title, description, height = 300 }: ChartProps) {
  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-accent-blue" />
            <CardTitle>{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-accent-blue" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#111827', fontWeight: '600' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cpu_usage" 
              stroke={COLORS.error} 
              strokeWidth={2}
              name="CPU Usage %"
            />
            <Line 
              type="monotone" 
              dataKey="memory_usage" 
              stroke={COLORS.warning} 
              strokeWidth={2}
              name="Memory Usage %"
            />
            <Line 
              type="monotone" 
              dataKey="disk_usage" 
              stroke={COLORS.info} 
              strokeWidth={2}
              name="Disk Usage %"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Revenue Trends Chart
// =====================================================

export function RevenueTrendsChart({ data, loading, title, description, height = 300 }: ChartProps) {
  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-accent-blue" />
            <CardTitle>{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-accent-blue" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#111827', fontWeight: '600' }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS.success}
              fill="url(#revenueGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Analytics Dashboard Container
// =====================================================

interface AnalyticsDashboardProps {
  loading?: boolean;
  onRefresh?: () => void;
}

export function AnalyticsDashboard({ loading = false, onRefresh }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API
  const userGrowthData = [
    { date: '2024-01', value: 1200 },
    { date: '2024-02', value: 1350 },
    { date: '2024-03', value: 1480 },
    { date: '2024-04', value: 1620 },
    { date: '2024-05', value: 1750 },
    { date: '2024-06', value: 1890 },
    { date: '2024-07', value: 2050 },
    { date: '2024-08', value: 2180 },
    { date: '2024-09', value: 2320 },
    { date: '2024-10', value: 2450 },
    { date: '2024-11', value: 2580 },
    { date: '2024-12', value: 2720 },
  ];

  const contentUploadsData = [
    { date: '2024-01', value: 45 },
    { date: '2024-02', value: 52 },
    { date: '2024-03', value: 48 },
    { date: '2024-04', value: 61 },
    { date: '2024-05', value: 58 },
    { date: '2024-06', value: 67 },
    { date: '2024-07', value: 73 },
    { date: '2024-08', value: 69 },
    { date: '2024-09', value: 78 },
    { date: '2024-10', value: 82 },
    { date: '2024-11', value: 89 },
    { date: '2024-12', value: 95 },
  ];

  const engagementData = [
    { date: '2024-01', views: 1200, completions: 800, engagement_rate: 66.7 },
    { date: '2024-02', views: 1350, completions: 920, engagement_rate: 68.1 },
    { date: '2024-03', views: 1480, completions: 1020, engagement_rate: 68.9 },
    { date: '2024-04', views: 1620, completions: 1150, engagement_rate: 71.0 },
    { date: '2024-05', views: 1750, completions: 1280, engagement_rate: 73.1 },
    { date: '2024-06', views: 1890, completions: 1420, engagement_rate: 75.1 },
  ];

  const contentDistributionData = [
    { name: 'Machine Setup', value: 35, color: COLORS.primary },
    { name: 'Maintenance', value: 25, color: COLORS.success },
    { name: 'Troubleshooting', value: 20, color: COLORS.warning },
    { name: 'Safety', value: 15, color: COLORS.error },
    { name: 'Other', value: 5, color: COLORS.info },
  ];

  const systemPerformanceData = [
    { date: '00:00', cpu_usage: 45, memory_usage: 60, disk_usage: 25 },
    { date: '04:00', cpu_usage: 38, memory_usage: 58, disk_usage: 26 },
    { date: '08:00', cpu_usage: 72, memory_usage: 75, disk_usage: 27 },
    { date: '12:00', cpu_usage: 85, memory_usage: 82, disk_usage: 28 },
    { date: '16:00', cpu_usage: 78, memory_usage: 79, disk_usage: 29 },
    { date: '20:00', cpu_usage: 65, memory_usage: 70, disk_usage: 30 },
  ];

  const revenueData = [
    { date: '2024-01', value: 25000 },
    { date: '2024-02', value: 28000 },
    { date: '2024-03', value: 32000 },
    { date: '2024-04', value: 35000 },
    { date: '2024-05', value: 38000 },
    { date: '2024-06', value: 42000 },
    { date: '2024-07', value: 45000 },
    { date: '2024-08', value: 48000 },
    { date: '2024-09', value: 52000 },
    { date: '2024-10', value: 55000 },
    { date: '2024-11', value: 58000 },
    { date: '2024-12', value: 62000 },
  ];

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      toast.success('Analytics data refreshed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">Analytics Dashboard</h2>
          <p className="text-secondary-text">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserGrowthChart
              data={userGrowthData}
              loading={loading}
              title="User Growth"
              description="Monthly active users over time"
            />
            <ContentUploadsChart
              data={contentUploadsData}
              loading={loading}
              title="Content Uploads"
              description="Monthly video uploads"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EngagementTrendsChart
              data={engagementData}
              loading={loading}
              title="Engagement Trends"
              description="Views, completions, and engagement rates"
            />
            <ContentDistributionChart
              data={contentDistributionData}
              loading={loading}
              title="Content Distribution"
              description="Content by category"
            />
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserGrowthChart
            data={userGrowthData}
            loading={loading}
            title="User Growth Trends"
            description="Detailed user growth analytics"
            height={400}
          />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentUploadsChart
              data={contentUploadsData}
              loading={loading}
              title="Upload Trends"
              description="Content upload patterns"
              height={400}
            />
            <ContentDistributionChart
              data={contentDistributionData}
              loading={loading}
              title="Content Categories"
              description="Distribution by content type"
              height={400}
            />
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemPerformanceChart
              data={systemPerformanceData}
              loading={loading}
              title="System Performance"
              description="CPU, memory, and disk usage"
              height={400}
            />
            <RevenueTrendsChart
              data={revenueData}
              loading={loading}
              title="Revenue Trends"
              description="Monthly revenue growth"
              height={400}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
