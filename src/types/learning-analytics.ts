/**
 * Learning Analytics types for Winbro Training Reels
 * Based on learning_analytics table structure
 */

// Event types for learning analytics
export type LearningEventType = 
  | 'quiz_started' 
  | 'quiz_completed' 
  | 'quiz_abandoned'
  | 'module_started' 
  | 'module_completed' 
  | 'module_abandoned'
  | 'course_started' 
  | 'course_completed' 
  | 'course_abandoned'
  | 'certificate_earned' 
  | 'certificate_downloaded'
  | 'video_played' 
  | 'video_paused' 
  | 'video_completed'
  | 'search_performed' 
  | 'bookmark_created' 
  | 'note_added';

// Device types
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Learning analytics event
export interface LearningAnalyticsEvent {
  id: string;
  user_id: string;
  course_id: string;
  module_id?: string;
  quiz_id?: string;
  event_type: LearningEventType;
  event_data: Record<string, any>;
  duration: number; // in seconds
  score?: number;
  progress_percentage?: number;
  session_id?: string;
  device_type?: DeviceType;
  browser_info?: string;
  created_at: string;
}

// Learning analytics creation data
export interface LearningAnalyticsInsert {
  id?: string;
  user_id: string;
  course_id: string;
  module_id?: string;
  quiz_id?: string;
  event_type: LearningEventType;
  event_data?: Record<string, any>;
  duration?: number;
  score?: number;
  progress_percentage?: number;
  session_id?: string;
  device_type?: DeviceType;
  browser_info?: string;
}

// Learning analytics filters
export interface LearningAnalyticsFilters {
  user_id?: string;
  course_id?: string;
  module_id?: string;
  quiz_id?: string;
  event_type?: LearningEventType;
  device_type?: DeviceType;
  session_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Learning analytics summary
export interface LearningAnalyticsSummary {
  total_events: number;
  unique_users: number;
  unique_courses: number;
  unique_sessions: number;
  average_duration: number;
  completion_rate: number;
  engagement_score: number;
  top_events: Array<{
    event_type: LearningEventType;
    count: number;
    percentage: number;
  }>;
  device_breakdown: Array<{
    device_type: DeviceType;
    count: number;
    percentage: number;
  }>;
  time_series: Array<{
    date: string;
    events: number;
    users: number;
  }>;
}

// Course analytics
export interface CourseAnalytics {
  course_id: string;
  course_title: string;
  total_enrollments: number;
  total_completions: number;
  completion_rate: number;
  average_score: number;
  average_time_spent: number;
  drop_off_points: Array<{
    module_id: string;
    module_title: string;
    drop_off_rate: number;
  }>;
  engagement_metrics: {
    video_views: number;
    quiz_attempts: number;
    search_queries: number;
    bookmarks_created: number;
    notes_added: number;
  };
  user_progress: Array<{
    user_id: string;
    user_name: string;
    progress_percentage: number;
    last_accessed: string;
    time_spent: number;
  }>;
}

// User learning profile
export interface UserLearningProfile {
  user_id: string;
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_certificates_earned: number;
  average_score: number;
  total_time_spent: number;
  learning_streak: number;
  preferred_device_type: DeviceType;
  learning_patterns: {
    most_active_hours: number[];
    preferred_content_types: string[];
    average_session_duration: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earned_at: string;
    icon?: string;
  }>;
  recent_activity: LearningAnalyticsEvent[];
}

// Quiz analytics
export interface QuizAnalytics {
  quiz_id: string;
  quiz_title: string;
  total_attempts: number;
  unique_attempts: number;
  average_score: number;
  pass_rate: number;
  average_time_spent: number;
  question_analytics: Array<{
    question_id: string;
    question_text: string;
    correct_rate: number;
    average_time: number;
    common_wrong_answers: string[];
  }>;
  difficulty_analysis: {
    easy_questions: number;
    medium_questions: number;
    hard_questions: number;
    overall_difficulty: number;
  };
  user_performance: Array<{
    user_id: string;
    user_name: string;
    best_score: number;
    attempts: number;
    last_attempt: string;
  }>;
}

// Learning analytics dashboard data
export interface LearningAnalyticsDashboard {
  overview: LearningAnalyticsSummary;
  top_courses: CourseAnalytics[];
  recent_events: LearningAnalyticsEvent[];
  user_engagement: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    retention_rate: number;
  };
  content_performance: {
    most_viewed_videos: Array<{
      video_id: string;
      title: string;
      views: number;
      completion_rate: number;
    }>;
    most_attempted_quizzes: Array<{
      quiz_id: string;
      title: string;
      attempts: number;
      pass_rate: number;
    }>;
  };
}

// Learning analytics component props
export interface LearningAnalyticsChartProps {
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  xAxisKey: string;
  yAxisKey: string;
  color?: string;
  height?: number;
}

export interface LearningAnalyticsTableProps {
  data: any[];
  columns: Array<{
    key: string;
    title: string;
    render?: (value: any, record: any) => React.ReactNode;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onChange: (page: number, limit: number) => void;
  };
  loading?: boolean;
}

// Learning analytics API response types
export interface LearningAnalyticsResponse {
  events: LearningAnalyticsEvent[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface LearningAnalyticsSummaryResponse {
  summary: LearningAnalyticsSummary;
  success: boolean;
  message?: string;
}

export interface CourseAnalyticsResponse {
  analytics: CourseAnalytics;
  success: boolean;
  message?: string;
}

export interface UserLearningProfileResponse {
  profile: UserLearningProfile;
  success: boolean;
  message?: string;
}

// Supabase query result type
export type LearningAnalyticsRow = LearningAnalyticsEvent;
