-- =====================================================
-- Migration: Create User Management Tables
-- Created: 2024-12-21T12:00:00Z
-- Tables: user_roles, user_sessions, user_activity_log, admin_audit_log
-- Purpose: Enable comprehensive user management and activity tracking
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
-- TABLE: user_roles
-- Purpose: Define user roles and permissions
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT user_roles_role_name_not_empty CHECK (length(trim(role_name)) > 0),
  CONSTRAINT user_roles_display_name_not_empty CHECK (length(trim(display_name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_roles_role_name_idx ON user_roles(role_name);
CREATE INDEX IF NOT EXISTS user_roles_is_admin_idx ON user_roles(is_admin);
CREATE INDEX IF NOT EXISTS user_roles_is_active_idx ON user_roles(is_active);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: user_sessions
-- Purpose: Track user login sessions and device information
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}'::jsonb,
  location JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_token_idx ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_is_active_idx ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: user_activity_log
-- Purpose: Track user actions and activities for analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT user_activity_log_action_not_empty CHECK (length(trim(action)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_activity_log_user_id_idx ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS user_activity_log_action_idx ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS user_activity_log_resource_type_idx ON user_activity_log(resource_type);
CREATE INDEX IF NOT EXISTS user_activity_log_created_at_idx ON user_activity_log(created_at DESC);

-- =====================================================
-- TABLE: admin_audit_log
-- Purpose: Track admin actions and system changes
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_resource_type TEXT,
  target_resource_id UUID,
  changes JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT admin_audit_log_action_type_not_empty CHECK (length(trim(action_type)) > 0),
  CONSTRAINT admin_audit_log_action_description_not_empty CHECK (length(trim(action_description)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_user_id_idx ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_type_idx ON admin_audit_log(action_type);
CREATE INDEX IF NOT EXISTS admin_audit_log_target_user_id_idx ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log(created_at DESC);

-- =====================================================
-- TABLE: user_invitations
-- Purpose: Manage user invitations and seat requests
-- =====================================================
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID,
  role_id UUID REFERENCES user_roles(id) ON DELETE SET NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT user_invitations_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT user_invitations_invitation_token_not_empty CHECK (length(trim(invitation_token)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_invitations_email_idx ON user_invitations(email);
CREATE INDEX IF NOT EXISTS user_invitations_invited_by_idx ON user_invitations(invited_by);
CREATE INDEX IF NOT EXISTS user_invitations_status_idx ON user_invitations(status);
CREATE INDEX IF NOT EXISTS user_invitations_expires_at_idx ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS user_invitations_invitation_token_idx ON user_invitations(invitation_token);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_invitations_updated_at ON user_invitations;
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: seat_requests
-- Purpose: Track seat allocation requests
-- =====================================================
CREATE TABLE IF NOT EXISTS seat_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID,
  requested_seats INTEGER NOT NULL CHECK (requested_seats > 0),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT seat_requests_reason_not_empty CHECK (length(trim(reason)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS seat_requests_user_id_idx ON seat_requests(user_id);
CREATE INDEX IF NOT EXISTS seat_requests_organization_id_idx ON seat_requests(organization_id);
CREATE INDEX IF NOT EXISTS seat_requests_status_idx ON seat_requests(status);
CREATE INDEX IF NOT EXISTS seat_requests_created_at_idx ON seat_requests(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_seat_requests_updated_at ON seat_requests;
CREATE TRIGGER update_seat_requests_updated_at
  BEFORE UPDATE ON seat_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_requests ENABLE ROW LEVEL SECURITY;

-- User roles policies (read-only for all authenticated users)
CREATE POLICY "user_roles_select_all"
  ON user_roles FOR SELECT
  USING (auth.role() = 'authenticated');

-- User sessions policies (users can only access their own sessions)
CREATE POLICY "user_sessions_select_own"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_insert_own"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_update_own"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_delete_own"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- User activity log policies (users can only access their own activity)
CREATE POLICY "user_activity_log_select_own"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_activity_log_insert_own"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin audit log policies (admin only)
CREATE POLICY "admin_audit_log_select_admin"
  ON admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  );

CREATE POLICY "admin_audit_log_insert_admin"
  ON admin_audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  );

-- User invitations policies (admin and invited user)
CREATE POLICY "user_invitations_select_admin_or_invited"
  ON user_invitations FOR SELECT
  USING (
    auth.uid() = invited_by OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  );

CREATE POLICY "user_invitations_insert_admin"
  ON user_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  );

CREATE POLICY "user_invitations_update_admin_or_invited"
  ON user_invitations FOR UPDATE
  USING (
    auth.uid() = invited_by OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  )
  WITH CHECK (
    auth.uid() = invited_by OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  );

-- Seat requests policies (users can access their own, admins can access all)
CREATE POLICY "seat_requests_select_own_or_admin"
  ON seat_requests FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  );

CREATE POLICY "seat_requests_insert_own"
  ON seat_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seat_requests_update_admin"
  ON seat_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON up.primary_role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.is_admin = TRUE
    )
  );

-- =====================================================
-- INSERT DEFAULT ROLES
-- =====================================================
INSERT INTO user_roles (role_name, display_name, description, permissions, is_admin) VALUES
('admin', 'Administrator', 'Full system access with all permissions', '{"all": true}', true),
('manager', 'Manager', 'Can manage users and content within their organization', '{"manage_users": true, "manage_content": true, "view_analytics": true}', false),
('trainer', 'Trainer', 'Can create and manage training content', '{"create_content": true, "manage_own_content": true, "view_analytics": true}', false),
('learner', 'Learner', 'Can view and complete training content', '{"view_content": true, "complete_courses": true}', false)
ON CONFLICT (role_name) DO NOTHING;

-- =====================================================
-- DOCUMENTATION
-- =====================================================
COMMENT ON TABLE user_roles IS 'User roles and permissions system';
COMMENT ON TABLE user_sessions IS 'User login sessions and device tracking';
COMMENT ON TABLE user_activity_log IS 'User activity tracking for analytics';
COMMENT ON TABLE admin_audit_log IS 'Admin action audit trail';
COMMENT ON TABLE user_invitations IS 'User invitation management';
COMMENT ON TABLE seat_requests IS 'Seat allocation requests';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS seat_requests CASCADE;
-- DROP TABLE IF EXISTS user_invitations CASCADE;
-- DROP TABLE IF EXISTS admin_audit_log CASCADE;
-- DROP TABLE IF EXISTS user_activity_log CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
