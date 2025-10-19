/**
 * React Query hooks for dashboard functionality
 * Handles data fetching, caching, and state management for dashboard components
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDashboardAnalytics,
  getRecommendedReels,
  getAssignedCourses,
  getRecentUserActivities,
  getUserActivitySummary,
  getUserPreferences,
  upsertUserPreferences,
  getUserDashboardWidgets,
  updateDashboardWidget,
  createDashboardWidget,
  getSearchSuggestions,
  trackUserActivity
} from '@/api/dashboard';
import type { 
  UserPreferencesInsert,
  DashboardWidgetInsert,
  DashboardWidgetUpdate,
  UserActivityInsert
} from '@/types/dashboard';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  analytics: (userId: string, timeframe: string) => ['dashboard', 'analytics', userId, timeframe] as const,
  recommendedReels: (userId: string) => ['dashboard', 'recommended-reels', userId] as const,
  assignedCourses: (userId: string) => ['dashboard', 'assigned-courses', userId] as const,
  recentActivity: (userId: string) => ['dashboard', 'recent-activity', userId] as const,
  activitySummary: (userId: string, days: number) => ['dashboard', 'activity-summary', userId, days] as const,
  preferences: (userId: string) => ['dashboard', 'preferences', userId] as const,
  widgets: (userId: string) => ['dashboard', 'widgets', userId] as const,
  searchSuggestions: (query: string) => ['dashboard', 'search-suggestions', query] as const,
};

// =====================================================
// DASHBOARD ANALYTICS HOOKS
// =====================================================

/**
 * Get dashboard analytics
 */
export const useDashboardAnalytics = (
  userId: string, 
  timeframe: 'week' | 'month' | 'quarter' = 'week'
) => {
  return useQuery({
    queryKey: dashboardKeys.analytics(userId, timeframe),
    queryFn: () => getDashboardAnalytics(userId, timeframe),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get recommended reels
 */
export const useRecommendedReels = (userId: string, limit: number = 6) => {
  return useQuery({
    queryKey: dashboardKeys.recommendedReels(userId),
    queryFn: () => getRecommendedReels(userId, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get assigned courses
 */
export const useAssignedCourses = (userId: string) => {
  return useQuery({
    queryKey: dashboardKeys.assignedCourses(userId),
    queryFn: () => getAssignedCourses(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get recent user activities
 */
export const useRecentActivities = (userId: string, limit: number = 10) => {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(userId),
    queryFn: () => getRecentUserActivities(userId, limit),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get user activity summary
 */
export const useUserActivitySummary = (userId: string, days: number = 7) => {
  return useQuery({
    queryKey: dashboardKeys.activitySummary(userId, days),
    queryFn: () => getUserActivitySummary(userId, days),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =====================================================
// USER PREFERENCES HOOKS
// =====================================================

/**
 * Get user preferences
 */
export const useUserPreferences = (userId: string) => {
  return useQuery({
    queryKey: dashboardKeys.preferences(userId),
    queryFn: () => getUserPreferences(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Update user preferences
 */
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, preferences }: { userId: string; preferences: UserPreferencesInsert }) =>
      upsertUserPreferences(userId, preferences),
    onSuccess: (data, variables) => {
      // Update the preferences in the cache
      queryClient.setQueryData(
        dashboardKeys.preferences(variables.userId),
        data
      );
    },
  });
};

// =====================================================
// DASHBOARD WIDGETS HOOKS
// =====================================================

/**
 * Get user dashboard widgets
 */
export const useDashboardWidgets = (userId: string) => {
  return useQuery({
    queryKey: dashboardKeys.widgets(userId),
    queryFn: () => getUserDashboardWidgets(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Update dashboard widget
 */
export const useUpdateDashboardWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ widgetId, updates }: { widgetId: string; updates: DashboardWidgetUpdate }) =>
      updateDashboardWidget(widgetId, updates),
    onSuccess: () => {
      // Invalidate widgets query to refetch
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

/**
 * Create dashboard widget
 */
export const useCreateDashboardWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (widget: DashboardWidgetInsert) => createDashboardWidget(widget),
    onSuccess: () => {
      // Invalidate widgets query to refetch
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

// =====================================================
// SEARCH SUGGESTIONS HOOKS
// =====================================================

/**
 * Get search suggestions
 */
export const useSearchSuggestions = (query: string, limit: number = 5) => {
  return useQuery({
    queryKey: dashboardKeys.searchSuggestions(query),
    queryFn: () => getSearchSuggestions(query, limit),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// =====================================================
// USER ACTIVITY TRACKING HOOKS
// =====================================================

/**
 * Track user activity
 */
export const useTrackUserActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activity: UserActivityInsert) => trackUserActivity(activity),
    onSuccess: () => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

// =====================================================
// COMBINED DASHBOARD HOOKS
// =====================================================

/**
 * Get all dashboard data for a user
 */
export const useDashboardData = (userId: string, timeframe: 'week' | 'month' | 'quarter' = 'week') => {
  const analytics = useDashboardAnalytics(userId, timeframe);
  const recommendedReels = useRecommendedReels(userId);
  const assignedCourses = useAssignedCourses(userId);
  const recentActivities = useRecentActivities(userId);
  const preferences = useUserPreferences(userId);

  return {
    analytics,
    recommendedReels,
    assignedCourses,
    recentActivities,
    preferences,
    isLoading: analytics.isLoading || recommendedReels.isLoading || assignedCourses.isLoading || recentActivities.isLoading || preferences.isLoading,
    error: analytics.error || recommendedReels.error || assignedCourses.error || recentActivities.error || preferences.error,
  };
};

/**
 * Track common user activities
 */
export const useActivityTracking = () => {
  const trackActivity = useTrackUserActivity();

  const trackVideoView = (userId: string, videoId: string, metadata?: Record<string, any>) => {
    return trackActivity.mutate({
      user_id: userId,
      activity_type: 'video_viewed',
      resource_type: 'video',
      resource_id: videoId,
      metadata: metadata || {},
    });
  };

  const trackVideoCompletion = (userId: string, videoId: string, metadata?: Record<string, any>) => {
    return trackActivity.mutate({
      user_id: userId,
      activity_type: 'video_completed',
      resource_type: 'video',
      resource_id: videoId,
      metadata: metadata || {},
    });
  };

  const trackCourseStart = (userId: string, courseId: string, metadata?: Record<string, any>) => {
    return trackActivity.mutate({
      user_id: userId,
      activity_type: 'course_started',
      resource_type: 'course',
      resource_id: courseId,
      metadata: metadata || {},
    });
  };

  const trackCourseCompletion = (userId: string, courseId: string, metadata?: Record<string, any>) => {
    return trackActivity.mutate({
      user_id: userId,
      activity_type: 'course_completed',
      resource_type: 'course',
      resource_id: courseId,
      metadata: metadata || {},
    });
  };

  const trackSearch = (userId: string, query: string, metadata?: Record<string, any>) => {
    return trackActivity.mutate({
      user_id: userId,
      activity_type: 'search_performed',
      resource_type: 'search',
      resource_id: null,
      metadata: { query, ...metadata },
    });
  };

  return {
    trackVideoView,
    trackVideoCompletion,
    trackCourseStart,
    trackCourseCompletion,
    trackSearch,
    isLoading: trackActivity.isPending,
    error: trackActivity.error,
  };
};
