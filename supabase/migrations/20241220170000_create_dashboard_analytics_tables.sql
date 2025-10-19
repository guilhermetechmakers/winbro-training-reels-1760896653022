-- =====================================================
-- Migration: Create Dashboard Analytics Tables
-- Created: 2024-12-20T17:00:00Z
-- Tables: user_activity, dashboard_widgets, user_preferences
-- Purpose: Support dashboard analytics and user activity tracking
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: user_activity
-- Purpose: Track user activities for dashboard analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'video_viewed', 'video_completed', 'video_bookmarked', 'video_shared',
    'course_started', 'course_completed', 'course_enrolled',
    'quiz_started', 'quiz_completed', 'quiz_passed', 'quiz_failed',
    'content_uploaded', 'content_edited', 'content_deleted',
    'search_performed', 'filter_applied', 'download_requested'
  )),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'course', 'quiz', 'search', 'other')),
  resource_id UUID,
  
  -- Activity metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_activity_user_id_not_empty CHECK (user_id IS NOT NULL),
  CONSTRAINT user_activity_type_not_empty CHECK (length(trim(activity_type)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_activity_user_id_idx ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS user_activity_created_at_idx ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS user_activity_type_idx ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS user_activity_resource_idx ON user_activity(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS user_activity_session_idx ON user_activity(session_id) WHERE session_id IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_activity_updated_at ON user_activity;
CREATE TRIGGER update_user_activity_updated_at
  BEFORE UPDATE ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own activity
CREATE POLICY "user_activity_select_own"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_activity_insert_own"
  ON user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all activity
CREATE POLICY "user_activity_admin_select_all"
  ON user_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- TABLE: dashboard_widgets
-- Purpose: Store user dashboard widget preferences and configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Widget configuration
  widget_type TEXT NOT NULL CHECK (widget_type IN (
    'recent_activity', 'recommended_reels', 'assigned_courses', 
    'analytics_snapshot', 'quick_actions', 'top_machines',
    'progress_chart', 'completion_stats', 'skill_distribution'
  )),
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  
  -- Widget settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT dashboard_widgets_user_id_not_empty CHECK (user_id IS NOT NULL),
  CONSTRAINT dashboard_widgets_type_not_empty CHECK (length(trim(widget_type)) > 0),
  CONSTRAINT dashboard_widgets_position_positive CHECK (position >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS dashboard_widgets_user_id_idx ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS dashboard_widgets_position_idx ON dashboard_widgets(user_id, position);
CREATE INDEX IF NOT EXISTS dashboard_widgets_visible_idx ON dashboard_widgets(user_id, is_visible) WHERE is_visible = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_dashboard_widgets_updated_at ON dashboard_widgets;
CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own widgets
CREATE POLICY "dashboard_widgets_select_own"
  ON dashboard_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "dashboard_widgets_insert_own"
  ON dashboard_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_widgets_update_own"
  ON dashboard_widgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_widgets_delete_own"
  ON dashboard_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: user_preferences
-- Purpose: Store user dashboard and application preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Dashboard preferences
  dashboard_layout TEXT DEFAULT 'default' CHECK (dashboard_layout IN ('default', 'compact', 'detailed')),
  default_view TEXT DEFAULT 'grid' CHECK (default_view IN ('grid', 'list')),
  items_per_page INTEGER DEFAULT 12 CHECK (items_per_page > 0 AND items_per_page <= 100),
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  course_reminders BOOLEAN DEFAULT true,
  new_content_alerts BOOLEAN DEFAULT true,
  
  -- Search preferences
  search_suggestions BOOLEAN DEFAULT true,
  voice_search_enabled BOOLEAN DEFAULT false,
  search_history_enabled BOOLEAN DEFAULT true,
  
  -- Display preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en' CHECK (length(language) = 2),
  timezone TEXT DEFAULT 'UTC',
  
  -- Additional preferences
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_preferences_user_id_not_empty CHECK (user_id IS NOT NULL)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "user_preferences_select_own"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS: Dashboard Analytics
-- Purpose: Helper functions for dashboard analytics
-- =====================================================

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  activity_type TEXT,
  count BIGINT,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.activity_type,
    COUNT(*) as count,
    MAX(ua.created_at) as last_activity
  FROM user_activity ua
  WHERE ua.user_id = p_user_id
    AND ua.created_at >= NOW() - INTERVAL '1 day' * p_days
  GROUP BY ua.activity_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard analytics
CREATE OR REPLACE FUNCTION get_dashboard_analytics(
  p_user_id UUID,
  p_timeframe TEXT DEFAULT 'week'
)
RETURNS TABLE (
  total_reels BIGINT,
  total_courses BIGINT,
  completed_this_period BIGINT,
  total_views BIGINT,
  completion_rate NUMERIC,
  engagement_score NUMERIC
) AS $$
DECLARE
  start_date TIMESTAMPTZ;
  end_date TIMESTAMPTZ := NOW();
BEGIN
  -- Calculate start date based on timeframe
  CASE p_timeframe
    WHEN 'week' THEN start_date := end_date - INTERVAL '7 days';
    WHEN 'month' THEN start_date := end_date - INTERVAL '30 days';
    WHEN 'quarter' THEN start_date := end_date - INTERVAL '90 days';
    ELSE start_date := end_date - INTERVAL '7 days';
  END CASE;

  RETURN QUERY
  WITH activity_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE activity_type = 'video_viewed') as total_views,
      COUNT(*) FILTER (WHERE activity_type = 'course_completed') as completed_courses,
      COUNT(*) FILTER (WHERE activity_type IN ('video_completed', 'course_completed', 'quiz_passed')) as total_completed
    FROM user_activity
    WHERE user_id = p_user_id
      AND created_at >= start_date
  ),
  content_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'published') as total_reels,
      COUNT(DISTINCT c.id) as total_courses
    FROM videos v
    LEFT JOIN courses c ON true
    WHERE v.user_id = p_user_id OR c.user_id = p_user_id
  )
  SELECT 
    COALESCE(cs.total_reels, 0)::BIGINT,
    COALESCE(cs.total_courses, 0)::BIGINT,
    COALESCE(ast.total_completed, 0)::BIGINT,
    COALESCE(ast.total_views, 0)::BIGINT,
    CASE 
      WHEN ast.total_views > 0 THEN (ast.total_completed::NUMERIC / ast.total_views::NUMERIC * 100)
      ELSE 0
    END as completion_rate,
    CASE 
      WHEN ast.total_views > 0 THEN LEAST(10, (ast.total_completed::NUMERIC / ast.total_views::NUMERIC * 10))
      ELSE 0
    END as engagement_score
  FROM activity_stats ast
  CROSS JOIN content_stats cs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DOCUMENTATION
-- =====================================================
COMMENT ON TABLE user_activity IS 'Tracks user activities for dashboard analytics and engagement metrics';
COMMENT ON TABLE dashboard_widgets IS 'User dashboard widget preferences and configurations';
COMMENT ON TABLE user_preferences IS 'User application and dashboard preferences';

COMMENT ON COLUMN user_activity.activity_type IS 'Type of activity performed by the user';
COMMENT ON COLUMN user_activity.resource_type IS 'Type of resource the activity relates to';
COMMENT ON COLUMN user_activity.resource_id IS 'ID of the specific resource (video, course, etc.)';
COMMENT ON COLUMN user_activity.metadata IS 'Additional activity metadata (scores, durations, etc.)';

COMMENT ON COLUMN dashboard_widgets.widget_type IS 'Type of dashboard widget';
COMMENT ON COLUMN dashboard_widgets.position IS 'Widget position in dashboard layout';
COMMENT ON COLUMN dashboard_widgets.is_visible IS 'Whether the widget is visible to the user';

COMMENT ON COLUMN user_preferences.dashboard_layout IS 'User preferred dashboard layout style';
COMMENT ON COLUMN user_preferences.default_view IS 'Default view mode for content lists';
COMMENT ON COLUMN user_preferences.items_per_page IS 'Number of items to display per page';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS user_preferences CASCADE;
-- DROP TABLE IF EXISTS dashboard_widgets CASCADE;
-- DROP TABLE IF EXISTS user_activity CASCADE;
-- DROP FUNCTION IF EXISTS get_user_activity_summary(UUID, INTEGER);
-- DROP FUNCTION IF EXISTS get_dashboard_analytics(UUID, TEXT);
