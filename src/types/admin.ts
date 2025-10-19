/**
 * Admin Dashboard Types
 * Generated: 2024-12-20T12:00:00Z
 */

// =====================================================
// Admin Analytics Types
// =====================================================

export interface AdminAnalytics {
  id: string;
  total_customers: number;
  active_customers: number;
  total_users: number;
  active_users: number;
  total_reels: number;
  published_reels: number;
  total_courses: number;
  published_courses: number;
  total_views: number;
  monthly_views: number;
  avg_completion_rate: number;
  avg_session_duration: number; // in seconds
  search_queries_count: number;
  period_start: string;
  period_end: string;
  period_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface AdminAnalyticsInsert {
  id?: string;
  total_customers?: number;
  active_customers?: number;
  total_users?: number;
  active_users?: number;
  total_reels?: number;
  published_reels?: number;
  total_courses?: number;
  published_courses?: number;
  total_views?: number;
  monthly_views?: number;
  avg_completion_rate?: number;
  avg_session_duration?: number;
  search_queries_count?: number;
  period_start: string;
  period_end: string;
  period_type?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface AdminAnalyticsUpdate {
  total_customers?: number;
  active_customers?: number;
  total_users?: number;
  active_users?: number;
  total_reels?: number;
  published_reels?: number;
  total_courses?: number;
  published_courses?: number;
  total_views?: number;
  monthly_views?: number;
  avg_completion_rate?: number;
  avg_session_duration?: number;
  search_queries_count?: number;
  period_start?: string;
  period_end?: string;
  period_type?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

// =====================================================
// Admin Metrics Types
// =====================================================

export interface AdminMetric {
  id: string;
  metric_name: string;
  metric_category: string;
  metric_value: number;
  metric_unit?: string;
  description?: string;
  tags: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AdminMetricInsert {
  id?: string;
  metric_name: string;
  metric_category: string;
  metric_value: number;
  metric_unit?: string;
  description?: string;
  tags?: Record<string, any>;
}

export interface AdminMetricUpdate {
  metric_name?: string;
  metric_category?: string;
  metric_value?: number;
  metric_unit?: string;
  description?: string;
  tags?: Record<string, any>;
}

// =====================================================
// Admin Reports Types
// =====================================================

export interface AdminReport {
  id: string;
  report_name: string;
  report_type: string;
  report_status: 'generating' | 'completed' | 'failed' | 'expired';
  report_data: Record<string, any>;
  file_url?: string;
  file_size?: number;
  parameters: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminReportInsert {
  id?: string;
  report_name: string;
  report_type: string;
  report_status?: 'generating' | 'completed' | 'failed' | 'expired';
  report_data?: Record<string, any>;
  file_url?: string;
  file_size?: number;
  parameters?: Record<string, any>;
  expires_at?: string;
}

export interface AdminReportUpdate {
  report_name?: string;
  report_type?: string;
  report_status?: 'generating' | 'completed' | 'failed' | 'expired';
  report_data?: Record<string, any>;
  file_url?: string;
  file_size?: number;
  parameters?: Record<string, any>;
  expires_at?: string;
}

// =====================================================
// Admin Audit Logs Types
// =====================================================

export interface AdminAuditLog {
  id: string;
  action_type: string;
  action_category: string;
  action_description: string;
  admin_user_id?: string;
  target_user_id?: string;
  target_resource_id?: string;
  target_resource_type?: string;
  action_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminAuditLogInsert {
  id?: string;
  action_type: string;
  action_category: string;
  action_description: string;
  admin_user_id?: string;
  target_user_id?: string;
  target_resource_id?: string;
  target_resource_type?: string;
  action_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// =====================================================
// Dashboard Overview Types
// =====================================================

export interface AdminDashboardOverview {
  total_customers: number;
  active_customers: number;
  total_users: number;
  active_users: number;
  total_reels: number;
  published_reels: number;
  total_courses: number;
  published_courses: number;
  total_views: number;
  monthly_views: number;
  avg_completion_rate: number;
  avg_session_duration: number;
  search_queries_count: number;
}

export interface AdminDashboardMetrics {
  engagement: AdminMetric[];
  content: AdminMetric[];
  infrastructure: AdminMetric[];
  performance: AdminMetric[];
}

export interface AdminDashboardStats {
  overview: AdminDashboardOverview;
  metrics: AdminDashboardMetrics;
  recent_activity: AdminAuditLog[];
  pending_approvals: number;
  system_health: number;
}

// =====================================================
// Chart Data Types
// =====================================================

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface AdminChartData {
  user_growth: ChartDataPoint[];
  content_uploads: ChartDataPoint[];
  engagement_trends: ChartDataPoint[];
  system_performance: ChartDataPoint[];
}

// =====================================================
// Management Section Types
// =====================================================

export interface UserManagementStats {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  users_by_role: {
    admin: number;
    trainer: number;
    learner: number;
  };
}

export interface ContentManagementStats {
  total_reels: number;
  pending_approval: number;
  published_reels: number;
  archived_reels: number;
  total_courses: number;
  published_courses: number;
  draft_courses: number;
}

export interface SubscriptionManagementStats {
  total_customers: number;
  active_subscriptions: number;
  trial_customers: number;
  churned_customers: number;
  monthly_revenue: number;
  average_revenue_per_customer: number;
}

// =====================================================
// API Response Types
// =====================================================

export interface AdminApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

// =====================================================
// Filter and Search Types
// =====================================================

export interface AdminFilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  periodType?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metricCategory?: string;
  reportType?: string;
  reportStatus?: string;
}

export interface AdminSearchParams {
  query?: string;
  filters?: AdminFilterOptions;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =====================================================
// Export Types
// =====================================================

export type AdminAnalyticsRow = AdminAnalytics;
export type AdminMetricRow = AdminMetric;
export type AdminReportRow = AdminReport;
export type AdminAuditLogRow = AdminAuditLog;
