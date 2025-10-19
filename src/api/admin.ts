/**
 * Admin API Layer
 * Handles all admin dashboard data fetching and mutations
 */

import { api } from '@/lib/api';
import type {
  AdminAnalytics,
  AdminAnalyticsInsert,
  AdminAnalyticsUpdate,
  AdminMetric,
  AdminMetricInsert,
  AdminMetricUpdate,
  AdminReport,
  AdminReportInsert,
  AdminReportUpdate,
  AdminAuditLog,
  AdminAuditLogInsert,
  AdminDashboardStats,
  AdminChartData,
  UserManagementStats,
  ContentManagementStats,
  SubscriptionManagementStats,
  AdminApiResponse,
  AdminPaginatedResponse,
  AdminSearchParams,
} from '@/types/admin';

// =====================================================
// Admin Analytics API
// =====================================================

export const adminAnalyticsApi = {
  // Get latest analytics data
  getLatest: async (): Promise<AdminApiResponse<AdminAnalytics>> => {
    return api.get<AdminApiResponse<AdminAnalytics>>('/admin/analytics/latest');
  },

  // Get analytics by period
  getByPeriod: async (params: {
    periodType: 'hourly' | 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
  }): Promise<AdminApiResponse<AdminAnalytics[]>> => {
    return api.get<AdminApiResponse<AdminAnalytics[]>>(
      `/admin/analytics/period?periodType=${params.periodType}&startDate=${params.startDate}&endDate=${params.endDate}`
    );
  },

  // Create analytics record
  create: async (data: AdminAnalyticsInsert): Promise<AdminApiResponse<AdminAnalytics>> => {
    return api.post<AdminApiResponse<AdminAnalytics>>('/admin/analytics', data);
  },

  // Update analytics record
  update: async (id: string, data: AdminAnalyticsUpdate): Promise<AdminApiResponse<AdminAnalytics>> => {
    return api.put<AdminApiResponse<AdminAnalytics>>(`/admin/analytics/${id}`, data);
  },

  // Delete analytics record
  delete: async (id: string): Promise<AdminApiResponse<void>> => {
    return api.delete(`/admin/analytics/${id}`) as Promise<AdminApiResponse<void>>;
  },
};

// =====================================================
// Admin Metrics API
// =====================================================

export const adminMetricsApi = {
  // Get all metrics
  getAll: async (): Promise<AdminApiResponse<AdminMetric[]>> => {
    return api.get<AdminApiResponse<AdminMetric[]>>('/admin/metrics');
  },

  // Get metrics by category
  getByCategory: async (category: string): Promise<AdminApiResponse<AdminMetric[]>> => {
    return api.get<AdminApiResponse<AdminMetric[]>>(`/admin/metrics/category/${category}`);
  },

  // Get specific metric
  getById: async (id: string): Promise<AdminApiResponse<AdminMetric>> => {
    return api.get<AdminApiResponse<AdminMetric>>(`/admin/metrics/${id}`);
  },

  // Create metric
  create: async (data: AdminMetricInsert): Promise<AdminApiResponse<AdminMetric>> => {
    return api.post<AdminApiResponse<AdminMetric>>('/admin/metrics', data);
  },

  // Update metric
  update: async (id: string, data: AdminMetricUpdate): Promise<AdminApiResponse<AdminMetric>> => {
    return api.put<AdminApiResponse<AdminMetric>>(`/admin/metrics/${id}`, data);
  },

  // Delete metric
  delete: async (id: string): Promise<AdminApiResponse<void>> => {
    return api.delete(`/admin/metrics/${id}`) as Promise<AdminApiResponse<void>>;
  },
};

// =====================================================
// Admin Reports API
// =====================================================

export const adminReportsApi = {
  // Get all reports
  getAll: async (params?: AdminSearchParams): Promise<AdminPaginatedResponse<AdminReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.query) queryParams.append('query', params.query);
    if (params?.filters?.reportType) queryParams.append('reportType', params.filters.reportType);
    if (params?.filters?.reportStatus) queryParams.append('reportStatus', params.filters.reportStatus);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return api.get<AdminPaginatedResponse<AdminReport>>(
      `/admin/reports?${queryParams.toString()}`
    );
  },

  // Get specific report
  getById: async (id: string): Promise<AdminApiResponse<AdminReport>> => {
    return api.get<AdminApiResponse<AdminReport>>(`/admin/reports/${id}`);
  },

  // Create report
  create: async (data: AdminReportInsert): Promise<AdminApiResponse<AdminReport>> => {
    return api.post<AdminApiResponse<AdminReport>>('/admin/reports', data);
  },

  // Update report
  update: async (id: string, data: AdminReportUpdate): Promise<AdminApiResponse<AdminReport>> => {
    return api.put<AdminApiResponse<AdminReport>>(`/admin/reports/${id}`, data);
  },

  // Delete report
  delete: async (id: string): Promise<AdminApiResponse<void>> => {
    return api.delete(`/admin/reports/${id}`) as Promise<AdminApiResponse<void>>;
  },

  // Generate report
  generate: async (reportType: string, parameters: Record<string, any>): Promise<AdminApiResponse<AdminReport>> => {
    return api.post<AdminApiResponse<AdminReport>>('/admin/reports/generate', {
      reportType,
      parameters,
    });
  },

  // Download report
  download: async (id: string): Promise<Blob> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/admin/reports/${id}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    return response.blob();
  },
};

// =====================================================
// Admin Audit Logs API
// =====================================================

export const adminAuditLogsApi = {
  // Get all audit logs
  getAll: async (params?: AdminSearchParams): Promise<AdminPaginatedResponse<AdminAuditLog>> => {
    const queryParams = new URLSearchParams();
    if (params?.query) queryParams.append('query', params.query);
    if (params?.filters?.dateRange?.start) queryParams.append('startDate', params.filters.dateRange.start);
    if (params?.filters?.dateRange?.end) queryParams.append('endDate', params.filters.dateRange.end);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return api.get<AdminPaginatedResponse<AdminAuditLog>>(
      `/admin/audit-logs?${queryParams.toString()}`
    );
  },

  // Get specific audit log
  getById: async (id: string): Promise<AdminApiResponse<AdminAuditLog>> => {
    return api.get<AdminApiResponse<AdminAuditLog>>(`/admin/audit-logs/${id}`);
  },

  // Create audit log
  create: async (data: AdminAuditLogInsert): Promise<AdminApiResponse<AdminAuditLog>> => {
    return api.post<AdminApiResponse<AdminAuditLog>>('/admin/audit-logs', data);
  },
};

// =====================================================
// Admin Dashboard API
// =====================================================

export const adminDashboardApi = {
  // Get dashboard overview stats
  getStats: async (): Promise<AdminApiResponse<AdminDashboardStats>> => {
    return api.get<AdminApiResponse<AdminDashboardStats>>('/admin/dashboard/stats');
  },

  // Get chart data
  getChartData: async (chartType: string, period: string): Promise<AdminApiResponse<AdminChartData>> => {
    return api.get<AdminApiResponse<AdminChartData>>(
      `/admin/dashboard/charts/${chartType}?period=${period}`
    );
  },

  // Get user management stats
  getUserStats: async (): Promise<AdminApiResponse<UserManagementStats>> => {
    return api.get<AdminApiResponse<UserManagementStats>>('/admin/dashboard/user-stats');
  },

  // Get content management stats
  getContentStats: async (): Promise<AdminApiResponse<ContentManagementStats>> => {
    return api.get<AdminApiResponse<ContentManagementStats>>('/admin/dashboard/content-stats');
  },

  // Get subscription management stats
  getSubscriptionStats: async (): Promise<AdminApiResponse<SubscriptionManagementStats>> => {
    return api.get<AdminApiResponse<SubscriptionManagementStats>>('/admin/dashboard/subscription-stats');
  },
};

// =====================================================
// Admin Management API
// =====================================================

export const adminManagementApi = {
  // User management
  users: {
    // Get all users with pagination
    getAll: async (params?: AdminSearchParams): Promise<AdminPaginatedResponse<any>> => {
      const queryParams = new URLSearchParams();
      if (params?.query) queryParams.append('query', params.query);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      return api.get<AdminPaginatedResponse<any>>(
        `/admin/users?${queryParams.toString()}`
      );
    },

    // Update user role
    updateRole: async (userId: string, role: string): Promise<AdminApiResponse<any>> => {
      return api.put<AdminApiResponse<any>>(`/admin/users/${userId}/role`, { role });
    },

    // Deactivate user
    deactivate: async (userId: string): Promise<AdminApiResponse<any>> => {
      return api.put<AdminApiResponse<any>>(`/admin/users/${userId}/deactivate`, {});
    },

    // Activate user
    activate: async (userId: string): Promise<AdminApiResponse<any>> => {
      return api.put<AdminApiResponse<any>>(`/admin/users/${userId}/activate`, {});
    },
  },

  // Content management
  content: {
    // Get content for moderation
    getModerationQueue: async (): Promise<AdminApiResponse<any[]>> => {
      return api.get<AdminApiResponse<any[]>>('/admin/content/moderation-queue');
    },

    // Approve content
    approve: async (contentId: string, contentType: 'reel' | 'course'): Promise<AdminApiResponse<any>> => {
      return api.put<AdminApiResponse<any>>(`/admin/content/${contentType}/${contentId}/approve`, {});
    },

    // Reject content
    reject: async (contentId: string, contentType: 'reel' | 'course', reason: string): Promise<AdminApiResponse<any>> => {
      return api.put<AdminApiResponse<any>>(`/admin/content/${contentType}/${contentId}/reject`, { reason });
    },

    // Archive content
    archive: async (contentId: string, contentType: 'reel' | 'course'): Promise<AdminApiResponse<any>> => {
      return api.put<AdminApiResponse<any>>(`/admin/content/${contentType}/${contentId}/archive`, {});
    },
  },

  // Subscription management
  subscriptions: {
    // Get all subscriptions
    getAll: async (params?: AdminSearchParams): Promise<AdminPaginatedResponse<any>> => {
      const queryParams = new URLSearchParams();
      if (params?.query) queryParams.append('query', params.query);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      return api.get<AdminPaginatedResponse<any>>(
        `/admin/subscriptions?${queryParams.toString()}`
      );
    },

    // Update subscription
    update: async (subscriptionId: string, data: any): Promise<AdminApiResponse<any>> => {
      return api.put<AdminApiResponse<any>>(`/admin/subscriptions/${subscriptionId}`, data);
    },

    // Cancel subscription
    cancel: async (subscriptionId: string, reason: string): Promise<AdminApiResponse<any>> => {
      return api.put<AdminApiResponse<any>>(`/admin/subscriptions/${subscriptionId}/cancel`, { reason });
    },
  },
};

// =====================================================
// Export all APIs
// =====================================================

export const adminApi = {
  analytics: adminAnalyticsApi,
  metrics: adminMetricsApi,
  reports: adminReportsApi,
  auditLogs: adminAuditLogsApi,
  dashboard: adminDashboardApi,
  management: adminManagementApi,
};
