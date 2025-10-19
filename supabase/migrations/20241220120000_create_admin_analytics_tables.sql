-- =====================================================
-- Migration: Create Admin Analytics Tables
-- Created: 2024-12-20T12:00:00Z
-- Tables: admin_analytics, admin_metrics, admin_reports
-- Purpose: Support admin dashboard with analytics data
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
-- TABLE: admin_analytics
-- Purpose: Store aggregated analytics data for admin dashboard
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core metrics
  total_customers INTEGER DEFAULT 0 NOT NULL,
  active_customers INTEGER DEFAULT 0 NOT NULL,
  total_users INTEGER DEFAULT 0 NOT NULL,
  active_users INTEGER DEFAULT 0 NOT NULL,
  total_reels INTEGER DEFAULT 0 NOT NULL,
  published_reels INTEGER DEFAULT 0 NOT NULL,
  total_courses INTEGER DEFAULT 0 NOT NULL,
  published_courses INTEGER DEFAULT 0 NOT NULL,
  total_views BIGINT DEFAULT 0 NOT NULL,
  monthly_views BIGINT DEFAULT 0 NOT NULL,
  
  -- Engagement metrics
  avg_completion_rate DECIMAL(5,2) DEFAULT 0.0 NOT NULL,
  avg_session_duration INTEGER DEFAULT 0 NOT NULL, -- in seconds
  search_queries_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Time period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  period_type TEXT DEFAULT 'daily' CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT admin_analytics_period_valid CHECK (period_end > period_start),
  CONSTRAINT admin_analytics_metrics_positive CHECK (
    total_customers >= 0 AND
    active_customers >= 0 AND
    total_users >= 0 AND
    active_users >= 0 AND
    total_reels >= 0 AND
    published_reels >= 0 AND
    total_courses >= 0 AND
    published_courses >= 0 AND
    total_views >= 0 AND
    monthly_views >= 0
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS admin_analytics_period_idx ON admin_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS admin_analytics_type_idx ON admin_analytics(period_type);
CREATE INDEX IF NOT EXISTS admin_analytics_created_at_idx ON admin_analytics(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_admin_analytics_updated_at ON admin_analytics;
CREATE TRIGGER update_admin_analytics_updated_at
  BEFORE UPDATE ON admin_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: admin_metrics
-- Purpose: Store real-time metrics for admin dashboard
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Metric identification
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  
  -- Metadata
  description TEXT,
  tags JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT admin_metrics_name_not_empty CHECK (length(trim(metric_name)) > 0),
  CONSTRAINT admin_metrics_category_not_empty CHECK (length(trim(metric_category)) > 0),
  CONSTRAINT admin_metrics_value_valid CHECK (metric_value >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS admin_metrics_name_idx ON admin_metrics(metric_name);
CREATE INDEX IF NOT EXISTS admin_metrics_category_idx ON admin_metrics(metric_category);
CREATE INDEX IF NOT EXISTS admin_metrics_created_at_idx ON admin_metrics(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_admin_metrics_updated_at ON admin_metrics;
CREATE TRIGGER update_admin_metrics_updated_at
  BEFORE UPDATE ON admin_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: admin_reports
-- Purpose: Store generated reports and analytics exports
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Report identification
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_status TEXT DEFAULT 'generating' CHECK (report_status IN ('generating', 'completed', 'failed', 'expired')),
  
  -- Report data
  report_data JSONB DEFAULT '{}'::jsonb,
  file_url TEXT,
  file_size BIGINT,
  
  -- Parameters used to generate report
  parameters JSONB DEFAULT '{}'::jsonb,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT admin_reports_name_not_empty CHECK (length(trim(report_name)) > 0),
  CONSTRAINT admin_reports_type_not_empty CHECK (length(trim(report_type)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS admin_reports_type_idx ON admin_reports(report_type);
CREATE INDEX IF NOT EXISTS admin_reports_status_idx ON admin_reports(report_status);
CREATE INDEX IF NOT EXISTS admin_reports_created_at_idx ON admin_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_reports_expires_at_idx ON admin_reports(expires_at) WHERE expires_at IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_admin_reports_updated_at ON admin_reports;
CREATE TRIGGER update_admin_reports_updated_at
  BEFORE UPDATE ON admin_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: admin_audit_logs
-- Purpose: Track admin actions and system changes
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Action details
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  action_description TEXT NOT NULL,
  
  -- User and context
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_resource_id TEXT,
  target_resource_type TEXT,
  
  -- Action data
  action_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT admin_audit_logs_action_type_not_empty CHECK (length(trim(action_type)) > 0),
  CONSTRAINT admin_audit_logs_category_not_empty CHECK (length(trim(action_category)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS admin_audit_logs_action_type_idx ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS admin_audit_logs_category_idx ON admin_audit_logs(action_category);
CREATE INDEX IF NOT EXISTS admin_audit_logs_admin_user_idx ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx ON admin_audit_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "admin_analytics_admin_only"
  ON admin_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admin_metrics_admin_only"
  ON admin_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admin_reports_admin_only"
  ON admin_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admin_audit_logs_admin_only"
  ON admin_audit_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get latest analytics data
CREATE OR REPLACE FUNCTION get_latest_admin_analytics()
RETURNS TABLE (
  total_customers INTEGER,
  active_customers INTEGER,
  total_users INTEGER,
  active_users INTEGER,
  total_reels INTEGER,
  published_reels INTEGER,
  total_courses INTEGER,
  published_courses INTEGER,
  total_views BIGINT,
  monthly_views BIGINT,
  avg_completion_rate DECIMAL(5,2),
  avg_session_duration INTEGER,
  search_queries_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aa.total_customers,
    aa.active_customers,
    aa.total_users,
    aa.active_users,
    aa.total_reels,
    aa.published_reels,
    aa.total_courses,
    aa.published_courses,
    aa.total_views,
    aa.monthly_views,
    aa.avg_completion_rate,
    aa.avg_session_duration,
    aa.search_queries_count
  FROM admin_analytics aa
  WHERE aa.period_type = 'daily'
  ORDER BY aa.period_end DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get metrics by category
CREATE OR REPLACE FUNCTION get_admin_metrics_by_category(category_name TEXT)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metric_unit TEXT,
  description TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.metric_name,
    am.metric_value,
    am.metric_unit,
    am.description,
    am.created_at
  FROM admin_metrics am
  WHERE am.metric_category = category_name
  ORDER BY am.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (for development)
-- =====================================================

-- Insert sample analytics data
INSERT INTO admin_analytics (
  total_customers, active_customers, total_users, active_users,
  total_reels, published_reels, total_courses, published_courses,
  total_views, monthly_views, avg_completion_rate, avg_session_duration,
  search_queries_count, period_start, period_end, period_type
) VALUES (
  45, 42, 1247, 1189,
  3456, 3201, 89, 76,
  15678, 3245, 78.5, 420,
  892, NOW() - INTERVAL '1 day', NOW(), 'daily'
) ON CONFLICT DO NOTHING;

-- Insert sample metrics
INSERT INTO admin_metrics (metric_name, metric_category, metric_value, metric_unit, description) VALUES
('Active Sessions', 'engagement', 156, 'users', 'Currently active user sessions'),
('Upload Queue', 'content', 12, 'videos', 'Videos pending processing'),
('Moderation Queue', 'content', 8, 'videos', 'Videos awaiting approval'),
('System Health', 'infrastructure', 99.8, 'percent', 'Overall system uptime'),
('Storage Used', 'infrastructure', 2.4, 'TB', 'Total storage consumption'),
('API Response Time', 'performance', 245, 'ms', 'Average API response time')
ON CONFLICT DO NOTHING;

-- =====================================================
-- DOCUMENTATION
-- =====================================================
COMMENT ON TABLE admin_analytics IS 'Aggregated analytics data for admin dashboard overview';
COMMENT ON TABLE admin_metrics IS 'Real-time metrics and KPIs for admin monitoring';
COMMENT ON TABLE admin_reports IS 'Generated reports and analytics exports';
COMMENT ON TABLE admin_audit_logs IS 'Audit trail for admin actions and system changes';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS admin_audit_logs CASCADE;
-- DROP TABLE IF EXISTS admin_reports CASCADE;
-- DROP TABLE IF EXISTS admin_metrics CASCADE;
-- DROP TABLE IF EXISTS admin_analytics CASCADE;
-- DROP FUNCTION IF EXISTS get_latest_admin_analytics();
-- DROP FUNCTION IF EXISTS get_admin_metrics_by_category(TEXT);
