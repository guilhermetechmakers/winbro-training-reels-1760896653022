-- =====================================================
-- Migration: Create Security Audit Tables
-- Created: 2024-12-13T12:00:00Z
-- Tables: audit_logs, security_events, user_sessions, failed_login_attempts
-- Purpose: Implement comprehensive audit logging and security monitoring
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: audit_logs
-- Purpose: Comprehensive audit trail for all system activities
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(64),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS audit_logs_severity_idx ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS audit_logs_category_idx ON audit_logs(category);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_session_id_idx ON audit_logs(session_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_audit_logs_updated_at ON audit_logs;
CREATE TRIGGER update_audit_logs_updated_at
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own audit logs, admins can see all
CREATE POLICY "audit_logs_select_own"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "audit_logs_insert_system"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- System can insert audit logs

-- =====================================================
-- TABLE: security_events
-- Purpose: Security-specific events and alerts
-- =====================================================
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(64),
  request_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS security_events_user_id_idx ON security_events(user_id);
CREATE INDEX IF NOT EXISTS security_events_event_type_idx ON security_events(event_type);
CREATE INDEX IF NOT EXISTS security_events_severity_idx ON security_events(severity);
CREATE INDEX IF NOT EXISTS security_events_resolved_idx ON security_events(resolved);
CREATE INDEX IF NOT EXISTS security_events_created_at_idx ON security_events(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_security_events_updated_at ON security_events;
CREATE TRIGGER update_security_events_updated_at
  BEFORE UPDATE ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can see security events
CREATE POLICY "security_events_admin_only"
  ON security_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- TABLE: user_sessions
-- Purpose: Track user sessions and authentication events
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id VARCHAR(64) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(100),
  location_country VARCHAR(2),
  location_city VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_id_idx ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS user_sessions_is_active_idx ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own sessions
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

-- =====================================================
-- TABLE: failed_login_attempts
-- Purpose: Track failed login attempts for rate limiting
-- =====================================================
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempt_count INTEGER DEFAULT 1,
  first_attempt TIMESTAMPTZ DEFAULT NOW(),
  last_attempt TIMESTAMPTZ DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT FALSE,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS failed_login_attempts_email_idx ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS failed_login_attempts_ip_address_idx ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS failed_login_attempts_is_locked_idx ON failed_login_attempts(is_locked);
CREATE INDEX IF NOT EXISTS failed_login_attempts_last_attempt_idx ON failed_login_attempts(last_attempt DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_failed_login_attempts_updated_at ON failed_login_attempts;
CREATE TRIGGER update_failed_login_attempts_updated_at
  BEFORE UPDATE ON failed_login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only system can access failed login attempts
CREATE POLICY "failed_login_attempts_system_only"
  ON failed_login_attempts FOR ALL
  USING (false); -- No direct access, only through functions

-- =====================================================
-- TABLE: data_encryption_keys
-- Purpose: Store encryption keys for customer data isolation
-- =====================================================
CREATE TABLE IF NOT EXISTS data_encryption_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id VARCHAR(100) NOT NULL,
  key_type VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS data_encryption_keys_customer_id_idx ON data_encryption_keys(customer_id);
CREATE INDEX IF NOT EXISTS data_encryption_keys_key_type_idx ON data_encryption_keys(key_type);
CREATE INDEX IF NOT EXISTS data_encryption_keys_is_active_idx ON data_encryption_keys(is_active);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_data_encryption_keys_updated_at ON data_encryption_keys;
CREATE TRIGGER update_data_encryption_keys_updated_at
  BEFORE UPDATE ON data_encryption_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE data_encryption_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only system can access encryption keys
CREATE POLICY "data_encryption_keys_system_only"
  ON data_encryption_keys FOR ALL
  USING (false); -- No direct access, only through functions

-- =====================================================
-- FUNCTIONS: Security utilities
-- =====================================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50),
  p_resource_id VARCHAR(100) DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_severity VARCHAR(20) DEFAULT 'info',
  p_category VARCHAR(50) DEFAULT 'general',
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, old_values, new_values,
    ip_address, user_agent, severity, category, description, metadata
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id, p_old_values, p_new_values,
    p_ip_address, p_user_agent, p_severity, p_category, p_description, p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event_type VARCHAR(50),
  p_severity VARCHAR(20),
  p_title VARCHAR(200),
  p_description TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO security_events (
    user_id, event_type, severity, title, description,
    ip_address, user_agent, metadata
  ) VALUES (
    p_user_id, p_event_type, p_severity, p_title, p_description,
    p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier VARCHAR(255),
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
  window_start TIMESTAMPTZ;
BEGIN
  window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  SELECT COUNT(*) INTO attempt_count
  FROM failed_login_attempts
  WHERE (email = p_identifier OR ip_address::text = p_identifier)
    AND last_attempt > window_start;
  
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record failed login attempt
CREATE OR REPLACE FUNCTION record_failed_login(
  p_email VARCHAR(255),
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  existing_record RECORD;
BEGIN
  -- Check if record exists
  SELECT * INTO existing_record
  FROM failed_login_attempts
  WHERE email = p_email AND ip_address = p_ip_address;
  
  IF FOUND THEN
    -- Update existing record
    UPDATE failed_login_attempts
    SET attempt_count = attempt_count + 1,
        last_attempt = NOW(),
        is_locked = (attempt_count + 1 >= 5),
        locked_until = CASE 
          WHEN attempt_count + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
          ELSE locked_until
        END
    WHERE email = p_email AND ip_address = p_ip_address;
  ELSE
    -- Insert new record
    INSERT INTO failed_login_attempts (email, ip_address, user_agent)
    VALUES (p_email, p_ip_address, p_user_agent);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear failed login attempts
CREATE OR REPLACE FUNCTION clear_failed_logins(
  p_email VARCHAR(255),
  p_ip_address INET DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  IF p_ip_address IS NULL THEN
    DELETE FROM failed_login_attempts WHERE email = p_email;
  ELSE
    DELETE FROM failed_login_attempts 
    WHERE email = p_email AND ip_address = p_ip_address;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS: Automatic audit logging
-- =====================================================

-- Function to automatically log user table changes
CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      NEW.id,
      'user_created',
      'user',
      NEW.id::text,
      NULL,
      to_jsonb(NEW),
      NULL,
      NULL,
      'medium',
      'user_management',
      'User account created'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_audit_event(
      NEW.id,
      'user_updated',
      'user',
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      NULL,
      NULL,
      'medium',
      'user_management',
      'User account updated'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event(
      OLD.id,
      'user_deleted',
      'user',
      OLD.id::text,
      to_jsonb(OLD),
      NULL,
      NULL,
      NULL,
      'high',
      'user_management',
      'User account deleted'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user table
DROP TRIGGER IF EXISTS audit_user_changes_trigger ON users;
CREATE TRIGGER audit_user_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_user_changes();

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS data_encryption_keys CASCADE;
-- DROP TABLE IF EXISTS failed_login_attempts CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS security_events CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP FUNCTION IF EXISTS log_audit_event CASCADE;
-- DROP FUNCTION IF EXISTS log_security_event CASCADE;
-- DROP FUNCTION IF EXISTS check_rate_limit CASCADE;
-- DROP FUNCTION IF EXISTS record_failed_login CASCADE;
-- DROP FUNCTION IF EXISTS clear_failed_logins CASCADE;
-- DROP FUNCTION IF EXISTS audit_user_changes CASCADE;