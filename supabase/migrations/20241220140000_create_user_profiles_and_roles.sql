-- =====================================================
-- Migration: Create user profiles and roles system
-- Created: 2024-12-20T14:00:00Z
-- Tables: user_profiles, user_roles, user_sessions, password_reset_tokens
-- Purpose: Enable comprehensive user authentication, authorization, and profile management
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
-- TABLE: user_profiles
-- Purpose: Extended user profile information beyond auth.users
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Core profile information
  full_name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- Company and role information
  company TEXT NOT NULL,
  department TEXT,
  job_title TEXT,
  employee_id TEXT,
  
  -- Contact information
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  
  -- Preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  
  -- Security settings
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  last_password_change TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Status and verification
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  profile_completed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT user_profiles_full_name_not_empty CHECK (length(trim(full_name)) > 0),
  CONSTRAINT user_profiles_company_not_empty CHECK (length(trim(company)) > 0),
  CONSTRAINT user_profiles_failed_login_attempts_non_negative CHECK (failed_login_attempts >= 0),
  CONSTRAINT user_profiles_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$')
);

-- =====================================================
-- TABLE: user_roles
-- Purpose: Role-based access control system
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Role information
  role_name TEXT NOT NULL CHECK (role_name IN ('admin', 'trainer', 'learner', 'moderator', 'viewer')),
  scope TEXT DEFAULT 'organization' CHECK (scope IN ('global', 'organization', 'department', 'project')),
  scope_id TEXT, -- ID of the specific scope (organization ID, department ID, etc.)
  
  -- Permissions (stored as JSONB for flexibility)
  permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Assignment information
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_roles_unique_user_role_scope UNIQUE (user_id, role_name, scope, scope_id),
  CONSTRAINT user_roles_expires_at_future CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- =====================================================
-- TABLE: user_sessions
-- Purpose: Track user sessions for security and analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Session information
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  
  -- Location information
  country TEXT,
  city TEXT,
  timezone TEXT,
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_sessions_expires_at_future CHECK (expires_at > created_at),
  CONSTRAINT user_sessions_session_token_not_empty CHECK (length(trim(session_token)) > 0)
);

-- =====================================================
-- TABLE: password_reset_tokens
-- Purpose: Secure password reset token management
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Token information
  token TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL, -- Hashed version for security
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Usage tracking
  used_at TIMESTAMPTZ,
  used_ip INET,
  used_user_agent TEXT,
  
  -- Security
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT password_reset_tokens_expires_at_future CHECK (expires_at > created_at),
  CONSTRAINT password_reset_tokens_token_not_empty CHECK (length(trim(token)) > 0),
  CONSTRAINT password_reset_tokens_attempts_non_negative CHECK (attempts >= 0),
  CONSTRAINT password_reset_tokens_max_attempts_positive CHECK (max_attempts > 0)
);

-- =====================================================
-- TABLE: email_verification_tokens
-- Purpose: Email verification token management
-- =====================================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Token information
  token TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL, -- Hashed version for security
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Usage tracking
  used_at TIMESTAMPTZ,
  used_ip INET,
  used_user_agent TEXT,
  
  -- Security
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT email_verification_tokens_expires_at_future CHECK (expires_at > created_at),
  CONSTRAINT email_verification_tokens_token_not_empty CHECK (length(trim(token)) > 0),
  CONSTRAINT email_verification_tokens_email_valid CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT email_verification_tokens_attempts_non_negative CHECK (attempts >= 0),
  CONSTRAINT email_verification_tokens_max_attempts_positive CHECK (max_attempts > 0)
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_company_idx ON user_profiles(company);
CREATE INDEX IF NOT EXISTS user_profiles_status_idx ON user_profiles(status);
CREATE INDEX IF NOT EXISTS user_profiles_email_verified_idx ON user_profiles(email_verified);
CREATE INDEX IF NOT EXISTS user_profiles_last_login_idx ON user_profiles(last_login_at DESC);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON user_profiles(created_at DESC);

-- User roles indexes
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_name_idx ON user_roles(role_name);
CREATE INDEX IF NOT EXISTS user_roles_scope_idx ON user_roles(scope, scope_id);
CREATE INDEX IF NOT EXISTS user_roles_active_idx ON user_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS user_roles_expires_at_idx ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- User sessions indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_token_idx ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_active_idx ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity DESC);

-- Password reset tokens indexes
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS password_reset_tokens_used_idx ON password_reset_tokens(used_at) WHERE used_at IS NULL;

-- Email verification tokens indexes
CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS email_verification_tokens_token_idx ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS email_verification_tokens_email_idx ON email_verification_tokens(email);
CREATE INDEX IF NOT EXISTS email_verification_tokens_expires_at_idx ON email_verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS email_verification_tokens_used_idx ON email_verification_tokens(used_at) WHERE used_at IS NULL;

-- =====================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================

-- User profiles trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User roles trigger
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User sessions trigger
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Password reset tokens trigger
DROP TRIGGER IF EXISTS update_password_reset_tokens_updated_at ON password_reset_tokens;
CREATE TRIGGER update_password_reset_tokens_updated_at
  BEFORE UPDATE ON password_reset_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Email verification tokens trigger
DROP TRIGGER IF EXISTS update_email_verification_tokens_updated_at ON email_verification_tokens;
CREATE TRIGGER update_email_verification_tokens_updated_at
  BEFORE UPDATE ON email_verification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- User profiles RLS Policies
CREATE POLICY "user_profiles_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all profiles
CREATE POLICY "user_profiles_select_admin"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role_name = 'admin' 
      AND user_roles.is_active = true
    )
  );

-- User roles RLS Policies
CREATE POLICY "user_roles_select_own"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_roles_select_admin"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role_name = 'admin' 
      AND user_roles.is_active = true
    )
  );

CREATE POLICY "user_roles_insert_admin"
  ON user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role_name = 'admin' 
      AND user_roles.is_active = true
    )
  );

CREATE POLICY "user_roles_update_admin"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role_name = 'admin' 
      AND user_roles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role_name = 'admin' 
      AND user_roles.is_active = true
    )
  );

-- User sessions RLS Policies
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

-- Password reset tokens RLS Policies
CREATE POLICY "password_reset_tokens_select_own"
  ON password_reset_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "password_reset_tokens_insert_own"
  ON password_reset_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "password_reset_tokens_update_own"
  ON password_reset_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Email verification tokens RLS Policies
CREATE POLICY "email_verification_tokens_select_own"
  ON email_verification_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "email_verification_tokens_insert_own"
  ON email_verification_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "email_verification_tokens_update_own"
  ON email_verification_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    user_id,
    full_name,
    company,
    email_verified
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function to assign default role to new users
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (
    user_id,
    role_name,
    scope,
    scope_id,
    assigned_at
  ) VALUES (
    NEW.user_id,
    'learner', -- Default role
    'organization',
    NEW.company,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to assign default role
DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens WHERE expires_at < NOW();
  DELETE FROM email_verification_tokens WHERE expires_at < NOW();
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond auth.users';
COMMENT ON COLUMN user_profiles.user_id IS 'Reference to auth.users.id';
COMMENT ON COLUMN user_profiles.full_name IS 'User full name (required)';
COMMENT ON COLUMN user_profiles.company IS 'User company (required)';
COMMENT ON COLUMN user_profiles.status IS 'User status: active, inactive, suspended, pending_verification';
COMMENT ON COLUMN user_profiles.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN user_profiles.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN user_profiles.locked_until IS 'Account lockout expiration time';

COMMENT ON TABLE user_roles IS 'Role-based access control assignments';
COMMENT ON COLUMN user_roles.role_name IS 'Role name: admin, trainer, learner, moderator, viewer';
COMMENT ON COLUMN user_roles.scope IS 'Role scope: global, organization, department, project';
COMMENT ON COLUMN user_roles.scope_id IS 'ID of the specific scope';
COMMENT ON COLUMN user_roles.permissions IS 'Role permissions stored as JSONB';
COMMENT ON COLUMN user_roles.expires_at IS 'Role expiration time (NULL for permanent)';

COMMENT ON TABLE user_sessions IS 'User session tracking for security and analytics';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique session identifier';
COMMENT ON COLUMN user_sessions.device_info IS 'Device information stored as JSONB';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether the session is currently active';
COMMENT ON COLUMN user_sessions.last_activity IS 'Last activity timestamp';

COMMENT ON TABLE password_reset_tokens IS 'Secure password reset token management';
COMMENT ON COLUMN password_reset_tokens.token IS 'Unique reset token';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'Hashed version of the token';
COMMENT ON COLUMN password_reset_tokens.attempts IS 'Number of verification attempts';
COMMENT ON COLUMN password_reset_tokens.max_attempts IS 'Maximum allowed attempts';

COMMENT ON TABLE email_verification_tokens IS 'Email verification token management';
COMMENT ON COLUMN email_verification_tokens.token IS 'Unique verification token';
COMMENT ON COLUMN email_verification_tokens.token_hash IS 'Hashed version of the token';
COMMENT ON COLUMN email_verification_tokens.email IS 'Email address being verified';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS assign_default_role();
-- DROP FUNCTION IF EXISTS create_user_profile();
-- DROP FUNCTION IF EXISTS cleanup_expired_tokens();
-- DROP TABLE IF EXISTS email_verification_tokens CASCADE;
-- DROP TABLE IF EXISTS password_reset_tokens CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
