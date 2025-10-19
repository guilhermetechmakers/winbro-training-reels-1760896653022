-- =====================================================
-- Migration: Create User Sessions Table
-- Created: 2024-12-20T15:00:00Z
-- Tables: user_sessions
-- Purpose: Track user sessions for security and activity logging
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
-- TABLE: user_sessions
-- Purpose: Track user login sessions and activity
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Session details
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  location JSONB DEFAULT '{}'::jsonb,
  
  -- Session state
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_sessions_token_not_empty CHECK (length(trim(session_token)) > 0),
  CONSTRAINT user_sessions_expires_future CHECK (expires_at > created_at)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_token_idx ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_active_idx ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS user_sessions_expires_idx ON user_sessions(expires_at);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own sessions
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

-- Documentation
COMMENT ON TABLE user_sessions IS 'User login sessions and activity tracking for security and audit purposes';
COMMENT ON COLUMN user_sessions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN user_sessions.user_id IS 'Owner of this session (references auth.users)';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique session identifier';
COMMENT ON COLUMN user_sessions.device_info IS 'Device information (browser, OS, etc.)';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP address of the session';
COMMENT ON COLUMN user_sessions.user_agent IS 'User agent string';
COMMENT ON COLUMN user_sessions.location IS 'Geographic location data';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether the session is currently active';
COMMENT ON COLUMN user_sessions.last_activity IS 'Last activity timestamp';
COMMENT ON COLUMN user_sessions.expires_at IS 'Session expiration timestamp';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS user_sessions CASCADE;
