/**
 * Dashboard-related types for Winbro Training Reels
 * Generated: 2024-12-20T17:00:00Z
 */

// User Activity Types
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'video_viewed' | 'video_completed' | 'video_bookmarked' | 'video_shared' |
                'course_started' | 'course_completed' | 'course_enrolled' |
                'quiz_started' | 'quiz_completed' | 'quiz_passed' | 'quiz_failed' |
                'content_uploaded' | 'content_edited' | 'content_deleted' |
                'search_performed' | 'filter_applied' | 'download_requested';
  resource_type: 'video' | 'course' | 'quiz' | 'search' | 'other';
  resource_id: string | null;
  metadata: Record<string, any>;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserActivityInsert {
  id?: string;
  user_id: string;
  activity_type: UserActivity['activity_type'];
  resource_type: UserActivity['resource_type'];
  resource_id?: string | null;
  metadata?: Record<string, any>;
  session_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface UserActivityUpdate {
  activity_type?: UserActivity['activity_type'];
  resource_type?: UserActivity['resource_type'];
  resource_id?: string | null;
  metadata?: Record<string, any>;
  session_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

// Dashboard Widgets Types
export interface DashboardWidget {
  id: string;
  user_id: string;
  widget_type: 'recent_activity' | 'recommended_reels' | 'assigned_courses' | 
              'analytics_snapshot' | 'quick_actions' | 'top_machines' |
              'progress_chart' | 'completion_stats' | 'skill_distribution';
  position: number;
  is_visible: boolean;
  size: 'small' | 'medium' | 'large';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidgetInsert {
  id?: string;
  user_id: string;
  widget_type: DashboardWidget['widget_type'];
  position?: number;
  is_visible?: boolean;
  size?: DashboardWidget['size'];
  settings?: Record<string, any>;
}

export interface DashboardWidgetUpdate {
  widget_type?: DashboardWidget['widget_type'];
  position?: number;
  is_visible?: boolean;
  size?: DashboardWidget['size'];
  settings?: Record<string, any>;
}

// User Preferences Types
export interface UserPreferences {
  id: string;
  user_id: string;
  dashboard_layout: 'default' | 'compact' | 'detailed';
  default_view: 'grid' | 'list';
  items_per_page: number;
  email_notifications: boolean;
  push_notifications: boolean;
  course_reminders: boolean;
  new_content_alerts: boolean;
  search_suggestions: boolean;
  voice_search_enabled: boolean;
  search_history_enabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInsert {
  id?: string;
  user_id: string;
  dashboard_layout?: UserPreferences['dashboard_layout'];
  default_view?: UserPreferences['default_view'];
  items_per_page?: number;
  email_notifications?: boolean;
  push_notifications?: boolean;
  course_reminders?: boolean;
  new_content_alerts?: boolean;
  search_suggestions?: boolean;
  voice_search_enabled?: boolean;
  search_history_enabled?: boolean;
  theme?: UserPreferences['theme'];
  language?: string;
  timezone?: string;
  preferences?: Record<string, any>;
}

export interface UserPreferencesUpdate {
  dashboard_layout?: UserPreferences['dashboard_layout'];
  default_view?: UserPreferences['default_view'];
  items_per_page?: number;
  email_notifications?: boolean;
  push_notifications?: boolean;
  course_reminders?: boolean;
  new_content_alerts?: boolean;
  search_suggestions?: boolean;
  voice_search_enabled?: boolean;
  search_history_enabled?: boolean;
  theme?: UserPreferences['theme'];
  language?: string;
  timezone?: string;
  preferences?: Record<string, any>;
}

// Dashboard Analytics Types
export interface DashboardAnalytics {
  total_reels: number;
  total_courses: number;
  completed_this_period: number;
  total_views: number;
  completion_rate: number;
  engagement_score: number;
}

export interface UserActivitySummary {
  activity_type: string;
  count: number;
  last_activity: string;
}

// Dashboard Component Props
export interface DashboardProps {
  user?: {
    id: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface RecommendedReel {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  tags: string[];
  views: number;
  author: string;
  published: string;
  machineModel?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  status: 'published' | 'archived';
  transcript?: string;
  description?: string;
}

export interface AssignedCourse {
  id: string;
  title: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  dueDate: string;
  instructor: string;
  status: 'in_progress' | 'not_started' | 'completed';
  estimatedTime: string;
  thumbnail?: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  certificate?: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'completed' | 'bookmarked' | 'uploaded' | 'started' | 'shared' | 'quiz_passed' | 'course_enrolled';
  title: string;
  time: string;
  icon: React.ReactNode;
  metadata?: Record<string, any>;
  link?: string;
}

export interface AnalyticsData {
  totalReels: number;
  totalCourses: number;
  completedThisWeek: number;
  totalViews: number;
  completionRate: number;
  topMachines: Array<{ name: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  timeToCompetency: number;
  engagementScore: number;
  weeklyProgress: Array<{ day: string; completed: number; total: number }>;
  skillDistribution: Array<{ skill: string; count: number; percentage: number }>;
  recentTrends: {
    views: number;
    completionRate: number;
    newContent: number;
  };
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'reel' | 'course' | 'tag' | 'machine' | 'process';
  count?: number;
}

// Supabase query result types
export type UserActivityRow = UserActivity;
export type DashboardWidgetRow = DashboardWidget;
export type UserPreferencesRow = UserPreferences;
