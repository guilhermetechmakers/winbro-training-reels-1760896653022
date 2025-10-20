-- =====================================================
-- Migration: Create Admin Management Tables
-- Created: 2024-12-21T14:00:00Z
-- Tables: admin_management_actions, admin_system_settings, admin_notifications
-- Purpose: Support admin management functionality and system settings
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
-- TABLE: admin_management_actions
-- Purpose: Track admin management actions and bulk operations
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_management_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Action details
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  action_description TEXT NOT NULL,
  
  -- Target information
  target_type TEXT NOT NULL, -- 'user', 'content', 'subscription', 'system'
  target_ids TEXT[] NOT NULL, -- Array of affected resource IDs
  
  -- Admin user
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Action parameters and results
  parameters JSONB DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT admin_management_actions_type_not_empty CHECK (length(trim(action_type)) > 0),
  CONSTRAINT admin_management_actions_category_not_empty CHECK (length(trim(action_category)) > 0),
  CONSTRAINT admin_management_actions_target_type_valid CHECK (target_type IN ('user', 'content', 'subscription', 'system'))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS admin_management_actions_type_idx ON admin_management_actions(action_type);
CREATE INDEX IF NOT EXISTS admin_management_actions_category_idx ON admin_management_actions(action_category);
CREATE INDEX IF NOT EXISTS admin_management_actions_admin_user_idx ON admin_management_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_management_actions_status_idx ON admin_management_actions(status);
CREATE INDEX IF NOT EXISTS admin_management_actions_created_at_idx ON admin_management_actions(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_admin_management_actions_updated_at ON admin_management_actions;
CREATE TRIGGER update_admin_management_actions_updated_at
  BEFORE UPDATE ON admin_management_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: admin_system_settings
-- Purpose: Store system-wide configuration and settings
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Setting identification
  setting_key TEXT UNIQUE NOT NULL,
  setting_category TEXT NOT NULL,
  setting_name TEXT NOT NULL,
  setting_description TEXT,
  
  -- Setting value and type
  setting_value JSONB NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('string', 'number', 'boolean', 'array', 'object')),
  
  -- Validation and constraints
  validation_rules JSONB DEFAULT '{}'::jsonb,
  is_required BOOLEAN DEFAULT false,
  is_sensitive BOOLEAN DEFAULT false,
  
  -- Change tracking
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT admin_system_settings_key_not_empty CHECK (length(trim(setting_key)) > 0),
  CONSTRAINT admin_system_settings_category_not_empty CHECK (length(trim(setting_category)) > 0),
  CONSTRAINT admin_system_settings_name_not_empty CHECK (length(trim(setting_name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS admin_system_settings_key_idx ON admin_system_settings(setting_key);
CREATE INDEX IF NOT EXISTS admin_system_settings_category_idx ON admin_system_settings(setting_category);
CREATE INDEX IF NOT EXISTS admin_system_settings_updated_at_idx ON admin_system_settings(updated_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_admin_system_settings_updated_at ON admin_system_settings;
CREATE TRIGGER update_admin_system_settings_updated_at
  BEFORE UPDATE ON admin_system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: admin_notifications
-- Purpose: Store admin notifications and alerts
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Notification details
  notification_type TEXT NOT NULL,
  notification_category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Priority and status
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed', 'archived')),
  
  -- Target admin users
  target_admin_ids UUID[] DEFAULT '{}'::uuid[], -- Empty array means all admins
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Action and context
  action_required BOOLEAN DEFAULT false,
  action_url TEXT,
  context_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  expires_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT admin_notifications_type_not_empty CHECK (length(trim(notification_type)) > 0),
  CONSTRAINT admin_notifications_category_not_empty CHECK (length(trim(notification_category)) > 0),
  CONSTRAINT admin_notifications_title_not_empty CHECK (length(trim(title)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS admin_notifications_type_idx ON admin_notifications(notification_type);
CREATE INDEX IF NOT EXISTS admin_notifications_category_idx ON admin_notifications(notification_category);
CREATE INDEX IF NOT EXISTS admin_notifications_priority_idx ON admin_notifications(priority);
CREATE INDEX IF NOT EXISTS admin_notifications_status_idx ON admin_notifications(status);
CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_expires_at_idx ON admin_notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_admin_notifications_updated_at ON admin_notifications;
CREATE TRIGGER update_admin_notifications_updated_at
  BEFORE UPDATE ON admin_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_management_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "admin_management_actions_admin_only"
  ON admin_management_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admin_system_settings_admin_only"
  ON admin_system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admin_notifications_admin_only"
  ON admin_notifications FOR ALL
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

-- Function to get system settings by category
CREATE OR REPLACE FUNCTION get_admin_system_settings_by_category(category_name TEXT)
RETURNS TABLE (
  setting_key TEXT,
  setting_name TEXT,
  setting_value JSONB,
  value_type TEXT,
  is_required BOOLEAN,
  is_sensitive BOOLEAN,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ass.setting_key,
    ass.setting_name,
    ass.setting_value,
    ass.value_type,
    ass.is_required,
    ass.is_sensitive,
    ass.updated_at
  FROM admin_system_settings ass
  WHERE ass.setting_category = category_name
  ORDER BY ass.setting_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active admin notifications
CREATE OR REPLACE FUNCTION get_active_admin_notifications()
RETURNS TABLE (
  id UUID,
  notification_type TEXT,
  notification_category TEXT,
  title TEXT,
  message TEXT,
  priority TEXT,
  action_required BOOLEAN,
  action_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    an.id,
    an.notification_type,
    an.notification_category,
    an.title,
    an.message,
    an.priority,
    an.action_required,
    an.action_url,
    an.created_at
  FROM admin_notifications an
  WHERE an.status IN ('unread', 'read')
    AND (an.expires_at IS NULL OR an.expires_at > NOW())
  ORDER BY 
    CASE an.priority 
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    an.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (for development)
-- =====================================================

-- Insert default system settings
INSERT INTO admin_system_settings (setting_key, setting_category, setting_name, setting_description, setting_value, value_type, is_required) VALUES
('maintenance_mode', 'system', 'Maintenance Mode', 'Enable maintenance mode for system updates', 'false'::jsonb, 'boolean', false),
('auto_approve_content', 'content', 'Auto-approve Content', 'Automatically approve new content uploads', 'false'::jsonb, 'boolean', false),
('email_notifications', 'notifications', 'Email Notifications', 'Send email notifications to users', 'true'::jsonb, 'boolean', false),
('analytics_enabled', 'analytics', 'Analytics Collection', 'Collect usage analytics and metrics', 'true'::jsonb, 'boolean', false),
('max_file_size', 'uploads', 'Max File Size (MB)', 'Maximum file size for uploads', '100'::jsonb, 'number', true),
('session_timeout', 'security', 'Session Timeout (minutes)', 'User session timeout duration', '480'::jsonb, 'number', true),
('content_moderation_required', 'content', 'Content Moderation Required', 'Require manual approval for all content', 'true'::jsonb, 'boolean', false),
('user_registration_enabled', 'users', 'User Registration Enabled', 'Allow new user registrations', 'true'::jsonb, 'boolean', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample notifications
INSERT INTO admin_notifications (notification_type, notification_category, title, message, priority, action_required, action_url) VALUES
('system_alert', 'infrastructure', 'High CPU Usage', 'Server CPU usage is above 80% for the last 15 minutes', 'high', true, '/admin/system/monitoring'),
('content_alert', 'moderation', 'Moderation Queue Full', '15 videos are pending approval in the moderation queue', 'medium', true, '/admin/content'),
('user_alert', 'users', 'New User Registration', '5 new users registered in the last hour', 'low', false, '/admin/users'),
('security_alert', 'security', 'Failed Login Attempts', 'Multiple failed login attempts detected from IP 192.168.1.100', 'high', true, '/admin/security'),
('billing_alert', 'billing', 'Payment Failed', 'Payment failed for customer Acme Corp subscription', 'critical', true, '/admin/billing')
ON CONFLICT DO NOTHING;

-- =====================================================
-- DOCUMENTATION
-- =====================================================
COMMENT ON TABLE admin_management_actions IS 'Track admin management actions and bulk operations';
COMMENT ON TABLE admin_system_settings IS 'Store system-wide configuration and settings';
COMMENT ON TABLE admin_notifications IS 'Store admin notifications and alerts';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS admin_notifications CASCADE;
-- DROP TABLE IF EXISTS admin_system_settings CASCADE;
-- DROP TABLE IF EXISTS admin_management_actions CASCADE;
-- DROP FUNCTION IF EXISTS get_admin_system_settings_by_category(TEXT);
-- DROP FUNCTION IF EXISTS get_active_admin_notifications();
