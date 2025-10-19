/**
 * Dashboard API functions for Winbro Training Reels
 * Handles user activity tracking, analytics, and dashboard data
 */

import { supabase } from '@/lib/supabase';
import type { 
  UserActivity, 
  UserActivityInsert, 
  DashboardAnalytics, 
  UserActivitySummary,
  UserPreferences,
  UserPreferencesInsert,
  DashboardWidget,
  DashboardWidgetInsert,
  DashboardWidgetUpdate
} from '@/types/dashboard';

// =====================================================
// USER ACTIVITY FUNCTIONS
// =====================================================

/**
 * Track user activity
 */
export async function trackUserActivity(activity: UserActivityInsert): Promise<UserActivity> {
  const { data, error } = await supabase
    .from('user_activity')
    .insert(activity)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to track activity: ${error.message}`);
  }

  return data;
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(
  userId: string, 
  days: number = 7
): Promise<UserActivitySummary[]> {
  const { data, error } = await supabase
    .rpc('get_user_activity_summary', {
      p_user_id: userId,
      p_days: days
    });

  if (error) {
    throw new Error(`Failed to get activity summary: ${error.message}`);
  }

  return data;
}

/**
 * Get recent user activities
 */
export async function getRecentUserActivities(
  userId: string, 
  limit: number = 10
): Promise<UserActivity[]> {
  const { data, error } = await supabase
    .from('user_activity')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get recent activities: ${error.message}`);
  }

  return data || [];
}

// =====================================================
// DASHBOARD ANALYTICS FUNCTIONS
// =====================================================

/**
 * Get dashboard analytics for a user
 */
export async function getDashboardAnalytics(
  userId: string, 
  timeframe: 'week' | 'month' | 'quarter' = 'week'
): Promise<DashboardAnalytics> {
  const { data, error } = await supabase
    .rpc('get_dashboard_analytics', {
      p_user_id: userId,
      p_timeframe: timeframe
    });

  if (error) {
    throw new Error(`Failed to get dashboard analytics: ${error.message}`);
  }

  return data[0] || {
    total_reels: 0,
    total_courses: 0,
    completed_this_period: 0,
    total_views: 0,
    completion_rate: 0,
    engagement_score: 0
  };
}

/**
 * Get recommended reels for a user
 */
export async function getRecommendedReels(_userId: string, limit: number = 6): Promise<any[]> {
  // This would typically use a recommendation algorithm
  // For now, we'll get recently published reels
  const { data, error } = await supabase
    .from('videos')
    .select(`
      id,
      title,
      description,
      duration,
      thumbnail_url,
      view_count,
      created_at,
      tags,
      machine_model,
      skill_level,
      status,
      user_id,
      users!videos_user_id_fkey(full_name)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get recommended reels: ${error.message}`);
  }

  return data?.map(reel => ({
    id: reel.id,
    title: reel.title,
    duration: formatDuration(reel.duration),
    thumbnail: reel.thumbnail_url || '/api/placeholder/300/200',
    tags: reel.tags || [],
    views: reel.view_count || 0,
    author: (reel.users as any)?.full_name || 'Unknown',
    published: formatTimeAgo(reel.created_at),
    machineModel: reel.machine_model,
    skillLevel: reel.skill_level,
    status: reel.status,
    description: reel.description
  })) || [];
}

/**
 * Get assigned courses for a user
 */
export async function getAssignedCourses(_userId: string): Promise<any[]> {
  // This would typically come from a course assignments table
  // For now, we'll return mock data
  return [
    {
      id: '1',
      title: "Machine Safety Fundamentals",
      progress: 75,
      totalModules: 8,
      completedModules: 6,
      dueDate: "2024-02-15",
      instructor: "Safety Team",
      status: "in_progress",
      estimatedTime: "2 hours remaining",
      thumbnail: "/api/placeholder/400/200",
      description: "Comprehensive safety training covering all machine shop operations",
      difficulty: "beginner",
      certificate: true
    },
    {
      id: '2',
      title: "Advanced CNC Operations",
      progress: 30,
      totalModules: 12,
      completedModules: 4,
      dueDate: "2024-02-28",
      instructor: "Operations Team",
      status: "in_progress",
      estimatedTime: "6 hours remaining",
      thumbnail: "/api/placeholder/400/200",
      description: "Master advanced CNC programming and operation techniques",
      difficulty: "advanced",
      certificate: true
    }
  ];
}

// =====================================================
// USER PREFERENCES FUNCTIONS
// =====================================================

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No preferences found, return default
      return null;
    }
    throw new Error(`Failed to get user preferences: ${error.message}`);
  }

  return data;
}

/**
 * Create or update user preferences
 */
export async function upsertUserPreferences(
  userId: string, 
  preferences: UserPreferencesInsert
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ ...preferences, user_id: userId })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user preferences: ${error.message}`);
  }

  return data;
}

// =====================================================
// DASHBOARD WIDGETS FUNCTIONS
// =====================================================

/**
 * Get user dashboard widgets
 */
export async function getUserDashboardWidgets(userId: string): Promise<DashboardWidget[]> {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_visible', true)
    .order('position');

  if (error) {
    throw new Error(`Failed to get dashboard widgets: ${error.message}`);
  }

  return data || [];
}

/**
 * Update dashboard widget
 */
export async function updateDashboardWidget(
  widgetId: string, 
  updates: DashboardWidgetUpdate
): Promise<DashboardWidget> {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .update(updates)
    .eq('id', widgetId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update dashboard widget: ${error.message}`);
  }

  return data;
}

/**
 * Create dashboard widget
 */
export async function createDashboardWidget(
  widget: DashboardWidgetInsert
): Promise<DashboardWidget> {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .insert(widget)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create dashboard widget: ${error.message}`);
  }

  return data;
}

// =====================================================
// SEARCH SUGGESTIONS FUNCTIONS
// =====================================================

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<any[]> {
  if (query.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('search_suggestions')
    .select('*')
    .ilike('suggestion_value', `%${query}%`)
    .order('usage_count', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get search suggestions: ${error.message}`);
  }

  return data?.map(suggestion => ({
    id: suggestion.id,
    text: suggestion.suggestion_value,
    type: suggestion.suggestion_type,
    count: suggestion.usage_count
  })) || [];
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format duration in seconds to MM:SS format
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format timestamp to time ago string
 */
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
}
