/**
 * Admin React Query Hooks
 * Provides data fetching and mutation hooks for admin dashboard
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type {
  AdminSearchParams,
  AdminAnalyticsInsert,
  AdminAnalyticsUpdate,
  AdminMetricInsert,
  AdminMetricUpdate,
  AdminReportInsert,
  AdminAuditLogInsert,
} from '@/types/admin';

// =====================================================
// Query Keys
// =====================================================

export const adminQueryKeys = {
  all: ['admin'] as const,
  analytics: () => [...adminQueryKeys.all, 'analytics'] as const,
  analyticsLatest: () => [...adminQueryKeys.analytics(), 'latest'] as const,
  analyticsPeriod: (params: { periodType: string; startDate: string; endDate: string }) =>
    [...adminQueryKeys.analytics(), 'period', params] as const,
  metrics: () => [...adminQueryKeys.all, 'metrics'] as const,
  metricsByCategory: (category: string) => [...adminQueryKeys.metrics(), 'category', category] as const,
  reports: () => [...adminQueryKeys.all, 'reports'] as const,
  reportsList: (params?: AdminSearchParams) => [...adminQueryKeys.reports(), 'list', params] as const,
  auditLogs: () => [...adminQueryKeys.all, 'auditLogs'] as const,
  auditLogsList: (params?: AdminSearchParams) => [...adminQueryKeys.auditLogs(), 'list', params] as const,
  dashboard: () => [...adminQueryKeys.all, 'dashboard'] as const,
  dashboardStats: () => [...adminQueryKeys.dashboard(), 'stats'] as const,
  dashboardCharts: (chartType: string, period: string) => [...adminQueryKeys.dashboard(), 'charts', chartType, period] as const,
  userStats: () => [...adminQueryKeys.dashboard(), 'userStats'] as const,
  contentStats: () => [...adminQueryKeys.dashboard(), 'contentStats'] as const,
  subscriptionStats: () => [...adminQueryKeys.dashboard(), 'subscriptionStats'] as const,
  management: () => [...adminQueryKeys.all, 'management'] as const,
  users: (params?: AdminSearchParams) => [...adminQueryKeys.management(), 'users', params] as const,
  contentModeration: () => [...adminQueryKeys.management(), 'content', 'moderation'] as const,
  subscriptions: (params?: AdminSearchParams) => [...adminQueryKeys.management(), 'subscriptions', params] as const,
};

// =====================================================
// Analytics Hooks
// =====================================================

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: adminQueryKeys.analyticsLatest(),
    queryFn: () => adminApi.analytics.getLatest(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useAdminAnalyticsByPeriod = (params: {
  periodType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}) => {
  return useQuery({
    queryKey: adminQueryKeys.analyticsPeriod(params),
    queryFn: () => adminApi.analytics.getByPeriod(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateAdminAnalytics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AdminAnalyticsInsert) => adminApi.analytics.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.analytics() });
    },
  });
};

export const useUpdateAdminAnalytics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminAnalyticsUpdate }) =>
      adminApi.analytics.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.analytics() });
    },
  });
};

// =====================================================
// Metrics Hooks
// =====================================================

export const useAdminMetrics = () => {
  return useQuery({
    queryKey: adminQueryKeys.metrics(),
    queryFn: () => adminApi.metrics.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useAdminMetricsByCategory = (category: string) => {
  return useQuery({
    queryKey: adminQueryKeys.metricsByCategory(category),
    queryFn: () => adminApi.metrics.getByCategory(category),
    enabled: !!category,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateAdminMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AdminMetricInsert) => adminApi.metrics.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.metrics() });
    },
  });
};

export const useUpdateAdminMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminMetricUpdate }) =>
      adminApi.metrics.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.metrics() });
    },
  });
};

// =====================================================
// Reports Hooks
// =====================================================

export const useAdminReports = (params?: AdminSearchParams) => {
  return useQuery({
    queryKey: adminQueryKeys.reportsList(params),
    queryFn: () => adminApi.reports.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminReport = (id: string) => {
  return useQuery({
    queryKey: [...adminQueryKeys.reports(), id],
    queryFn: () => adminApi.reports.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateAdminReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AdminReportInsert) => adminApi.reports.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports() });
    },
  });
};

export const useGenerateAdminReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reportType, parameters }: { reportType: string; parameters: Record<string, any> }) =>
      adminApi.reports.generate(reportType, parameters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports() });
    },
  });
};

export const useDownloadAdminReport = () => {
  return useMutation({
    mutationFn: (id: string) => adminApi.reports.download(id),
  });
};

// =====================================================
// Audit Logs Hooks
// =====================================================

export const useAdminAuditLogs = (params?: AdminSearchParams) => {
  return useQuery({
    queryKey: adminQueryKeys.auditLogsList(params),
    queryFn: () => adminApi.auditLogs.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateAdminAuditLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AdminAuditLogInsert) => adminApi.auditLogs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auditLogs() });
    },
  });
};

// =====================================================
// Dashboard Hooks
// =====================================================

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: adminQueryKeys.dashboardStats(),
    queryFn: () => adminApi.dashboard.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useAdminChartData = (chartType: string, period: string) => {
  return useQuery({
    queryKey: adminQueryKeys.dashboardCharts(chartType, period),
    queryFn: () => adminApi.dashboard.getChartData(chartType, period),
    enabled: !!chartType && !!period,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminUserStats = () => {
  return useQuery({
    queryKey: adminQueryKeys.userStats(),
    queryFn: () => adminApi.dashboard.getUserStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminContentStats = () => {
  return useQuery({
    queryKey: adminQueryKeys.contentStats(),
    queryFn: () => adminApi.dashboard.getContentStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminSubscriptionStats = () => {
  return useQuery({
    queryKey: adminQueryKeys.subscriptionStats(),
    queryFn: () => adminApi.dashboard.getSubscriptionStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =====================================================
// Management Hooks
// =====================================================

export const useAdminUsers = (params?: AdminSearchParams) => {
  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => adminApi.management.users.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.management.users.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.management() });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: 'activate' | 'deactivate' }) =>
      action === 'activate' 
        ? adminApi.management.users.activate(userId)
        : adminApi.management.users.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.management() });
    },
  });
};

export const useContentModerationQueue = () => {
  return useQuery({
    queryKey: adminQueryKeys.contentModeration(),
    queryFn: () => adminApi.management.content.getModerationQueue(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
  });
};

export const useApproveContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentId, contentType }: { contentId: string; contentType: 'reel' | 'course' }) =>
      adminApi.management.content.approve(contentId, contentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.contentModeration() });
    },
  });
};

export const useRejectContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentId, contentType, reason }: { contentId: string; contentType: 'reel' | 'course'; reason: string }) =>
      adminApi.management.content.reject(contentId, contentType, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.contentModeration() });
    },
  });
};

export const useArchiveContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentId, contentType }: { contentId: string; contentType: 'reel' | 'course' }) =>
      adminApi.management.content.archive(contentId, contentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.contentModeration() });
    },
  });
};

export const useAdminSubscriptions = (params?: AdminSearchParams) => {
  return useQuery({
    queryKey: adminQueryKeys.subscriptions(params),
    queryFn: () => adminApi.management.subscriptions.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, data }: { subscriptionId: string; data: any }) =>
      adminApi.management.subscriptions.update(subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.subscriptions() });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: string; reason: string }) =>
      adminApi.management.subscriptions.cancel(subscriptionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.subscriptions() });
    },
  });
};

// =====================================================
// Utility Hooks
// =====================================================

export const useAdminDataRefresh = () => {
  const queryClient = useQueryClient();
  
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
  };
  
  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
  };
  
  const refreshManagement = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.management() });
  };
  
  return {
    refreshAll,
    refreshDashboard,
    refreshManagement,
  };
};
