-- =====================================================
-- Migration: Create RBAC System
-- Created: 2024-12-13T13:00:00Z
-- Tables: roles, permissions, role_permissions, user_roles, resource_permissions
-- Purpose: Implement comprehensive role-based access control system
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
-- TABLE: roles
-- Purpose: Define system roles and their hierarchy
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0, -- Higher level = more permissions
  is_system_role BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS roles_name_idx ON roles(name);
CREATE INDEX IF NOT EXISTS roles_level_idx ON roles(level);
CREATE INDEX IF NOT EXISTS roles_is_active_idx ON roles(is_active);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage roles
CREATE POLICY "roles_admin_only"
  ON roles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- TABLE: permissions
-- Purpose: Define granular permissions for resources and actions
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(20) DEFAULT 'global' CHECK (scope IN ('global', 'organization', 'customer', 'user')),
  is_system_permission BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS permissions_name_idx ON permissions(name);
CREATE INDEX IF NOT EXISTS permissions_resource_type_idx ON permissions(resource_type);
CREATE INDEX IF NOT EXISTS permissions_action_idx ON permissions(action);
CREATE INDEX IF NOT EXISTS permissions_scope_idx ON permissions(scope);
CREATE INDEX IF NOT EXISTS permissions_is_active_idx ON permissions(is_active);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage permissions
CREATE POLICY "permissions_admin_only"
  ON permissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- TABLE: role_permissions
-- Purpose: Many-to-many relationship between roles and permissions
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, permission_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS role_permissions_role_id_idx ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS role_permissions_permission_id_idx ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS role_permissions_is_active_idx ON role_permissions(is_active);
CREATE INDEX IF NOT EXISTS role_permissions_expires_at_idx ON role_permissions(expires_at);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON role_permissions;
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage role permissions
CREATE POLICY "role_permissions_admin_only"
  ON role_permissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- TABLE: user_roles
-- Purpose: Assign roles to users with optional expiration
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS user_roles_is_active_idx ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS user_roles_expires_at_idx ON user_roles(expires_at);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can see their own roles, admins can see all
CREATE POLICY "user_roles_select_own"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "user_roles_admin_manage"
  ON user_roles FOR INSERT, UPDATE, DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- TABLE: resource_permissions
-- Purpose: Granular permissions for specific resources
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK ((user_id IS NOT NULL AND role_id IS NULL) OR (user_id IS NULL AND role_id IS NOT NULL))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS resource_permissions_user_id_idx ON resource_permissions(user_id);
CREATE INDEX IF NOT EXISTS resource_permissions_role_id_idx ON resource_permissions(role_id);
CREATE INDEX IF NOT EXISTS resource_permissions_resource_type_idx ON resource_permissions(resource_type);
CREATE INDEX IF NOT EXISTS resource_permissions_resource_id_idx ON resource_permissions(resource_id);
CREATE INDEX IF NOT EXISTS resource_permissions_permission_id_idx ON resource_permissions(permission_id);
CREATE INDEX IF NOT EXISTS resource_permissions_is_active_idx ON resource_permissions(is_active);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_resource_permissions_updated_at ON resource_permissions;
CREATE TRIGGER update_resource_permissions_updated_at
  BEFORE UPDATE ON resource_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE resource_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can see their own resource permissions, admins can see all
CREATE POLICY "resource_permissions_select_own"
  ON resource_permissions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "resource_permissions_admin_manage"
  ON resource_permissions FOR INSERT, UPDATE, DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- TABLE: customer_scopes
-- Purpose: Define customer-specific access scopes
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_scopes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id VARCHAR(100) NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  scope_type VARCHAR(50) NOT NULL CHECK (scope_type IN ('organization', 'department', 'project', 'machine')),
  scope_value VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(customer_id, scope_type, scope_value)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS customer_scopes_customer_id_idx ON customer_scopes(customer_id);
CREATE INDEX IF NOT EXISTS customer_scopes_scope_type_idx ON customer_scopes(scope_type);
CREATE INDEX IF NOT EXISTS customer_scopes_is_active_idx ON customer_scopes(is_active);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_customer_scopes_updated_at ON customer_scopes;
CREATE TRIGGER update_customer_scopes_updated_at
  BEFORE UPDATE ON customer_scopes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customer_scopes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage customer scopes
CREATE POLICY "customer_scopes_admin_only"
  ON customer_scopes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- FUNCTIONS: RBAC utilities
-- =====================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_permission_name VARCHAR(100),
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id VARCHAR(100) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Check direct user permissions
  SELECT EXISTS(
    SELECT 1 FROM resource_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.user_id = p_user_id
      AND p.name = p_permission_name
      AND (p_resource_type IS NULL OR rp.resource_type = p_resource_type)
      AND (p_resource_id IS NULL OR rp.resource_id = p_resource_id)
      AND rp.is_active = TRUE
      AND (rp.expires_at IS NULL OR rp.expires_at > NOW())
  ) INTO has_permission;
  
  IF has_permission THEN
    RETURN TRUE;
  END IF;
  
  -- Check role-based permissions
  SELECT EXISTS(
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.name = p_permission_name
      AND (p_resource_type IS NULL OR p.resource_type = p_resource_type)
      AND ur.is_active = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND rp.is_active = TRUE
      AND (rp.expires_at IS NULL OR rp.expires_at > NOW())
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_name VARCHAR(100),
  resource_type VARCHAR(50),
  scope VARCHAR(20),
  granted_via VARCHAR(20),
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  -- Direct user permissions
  SELECT 
    p.name as permission_name,
    p.resource_type,
    p.scope,
    'direct'::VARCHAR(20) as granted_via,
    rp.expires_at
  FROM resource_permissions rp
  JOIN permissions p ON rp.permission_id = p.id
  WHERE rp.user_id = p_user_id
    AND rp.is_active = TRUE
    AND (rp.expires_at IS NULL OR rp.expires_at > NOW())
  
  UNION ALL
  
  -- Role-based permissions
  SELECT 
    p.name as permission_name,
    p.resource_type,
    p.scope,
    'role'::VARCHAR(20) as granted_via,
    LEAST(ur.expires_at, rp.expires_at) as expires_at
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = TRUE
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    AND rp.is_active = TRUE
    AND (rp.expires_at IS NULL OR rp.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check customer scope access
CREATE OR REPLACE FUNCTION user_has_customer_scope(
  p_user_id UUID,
  p_customer_id VARCHAR(100),
  p_scope_type VARCHAR(50) DEFAULT NULL,
  p_scope_value VARCHAR(200) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  has_scope BOOLEAN := FALSE;
  user_company VARCHAR(200);
BEGIN
  -- Get user's company
  SELECT company INTO user_company
  FROM users
  WHERE id = p_user_id;
  
  -- Check if user's company matches customer or has specific scope access
  SELECT EXISTS(
    SELECT 1 FROM customer_scopes cs
    WHERE cs.customer_id = p_customer_id
      AND (p_scope_type IS NULL OR cs.scope_type = p_scope_type)
      AND (p_scope_value IS NULL OR cs.scope_value = p_scope_value)
      AND cs.is_active = TRUE
      AND (
        -- Direct company match
        cs.customer_id = user_company
        OR
        -- User has explicit scope permission
        EXISTS(
          SELECT 1 FROM resource_permissions rp
          JOIN permissions p ON rp.permission_id = p.id
          WHERE rp.user_id = p_user_id
            AND p.name = 'access_customer_scope'
            AND rp.resource_id = cs.id::text
            AND rp.is_active = TRUE
        )
      )
  ) INTO has_scope;
  
  RETURN has_scope;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign role to user
CREATE OR REPLACE FUNCTION assign_user_role(
  p_user_id UUID,
  p_role_name VARCHAR(50),
  p_assigned_by UUID,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  role_uuid UUID;
BEGIN
  -- Get role ID
  SELECT id INTO role_uuid
  FROM roles
  WHERE name = p_role_name AND is_active = TRUE;
  
  IF role_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert or update user role
  INSERT INTO user_roles (user_id, role_id, assigned_by, expires_at)
  VALUES (p_user_id, role_uuid, p_assigned_by, p_expires_at)
  ON CONFLICT (user_id, role_id)
  DO UPDATE SET
    assigned_by = p_assigned_by,
    expires_at = p_expires_at,
    is_active = TRUE,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, display_name, description, level, is_system_role) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', 100, TRUE),
('admin', 'Administrator', 'Administrative access to manage users and content', 80, TRUE),
('trainer', 'Trainer', 'Can create and manage training content', 60, TRUE),
('learner', 'Learner', 'Can view and consume training content', 40, TRUE),
('moderator', 'Moderator', 'Can moderate and approve content', 50, TRUE),
('customer_admin', 'Customer Administrator', 'Administrative access within customer scope', 70, FALSE)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, resource_type, action, scope) VALUES
-- User management permissions
('user_create', 'Create Users', 'Create new user accounts', 'user', 'create', 'global'),
('user_read', 'View Users', 'View user information', 'user', 'read', 'global'),
('user_update', 'Update Users', 'Update user information', 'user', 'update', 'global'),
('user_delete', 'Delete Users', 'Delete user accounts', 'user', 'delete', 'global'),
('user_manage_roles', 'Manage User Roles', 'Assign and modify user roles', 'user', 'manage_roles', 'global'),

-- Content management permissions
('content_create', 'Create Content', 'Create videos and courses', 'content', 'create', 'global'),
('content_read', 'View Content', 'View videos and courses', 'content', 'read', 'global'),
('content_update', 'Update Content', 'Update videos and courses', 'content', 'update', 'global'),
('content_delete', 'Delete Content', 'Delete videos and courses', 'content', 'delete', 'global'),
('content_moderate', 'Moderate Content', 'Approve and reject content', 'content', 'moderate', 'global'),

-- System administration permissions
('system_configure', 'Configure System', 'Configure system settings', 'system', 'configure', 'global'),
('system_monitor', 'Monitor System', 'View system logs and metrics', 'system', 'monitor', 'global'),
('system_backup', 'Backup System', 'Create and manage backups', 'system', 'backup', 'global'),

-- Customer scope permissions
('access_customer_scope', 'Access Customer Scope', 'Access customer-specific resources', 'customer', 'access', 'customer'),
('manage_customer_scope', 'Manage Customer Scope', 'Manage customer-specific settings', 'customer', 'manage', 'customer'),

-- Analytics permissions
('analytics_view', 'View Analytics', 'View system analytics and reports', 'analytics', 'read', 'global'),
('analytics_export', 'Export Analytics', 'Export analytics data', 'analytics', 'export', 'global')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE 
  -- Super admin gets all permissions
  (r.name = 'super_admin')
  OR
  -- Admin gets most permissions except super admin specific ones
  (r.name = 'admin' AND p.name NOT IN ('system_backup'))
  OR
  -- Trainer gets content creation and management permissions
  (r.name = 'trainer' AND p.name IN ('content_create', 'content_read', 'content_update', 'content_delete', 'analytics_view'))
  OR
  -- Learner gets read permissions
  (r.name = 'learner' AND p.name IN ('content_read', 'analytics_view'))
  OR
  -- Moderator gets content moderation permissions
  (r.name = 'moderator' AND p.name IN ('content_read', 'content_moderate', 'analytics_view'))
  OR
  -- Customer admin gets customer scope permissions
  (r.name = 'customer_admin' AND p.name IN ('user_read', 'user_update', 'content_read', 'content_create', 'content_update', 'access_customer_scope', 'manage_customer_scope', 'analytics_view'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS resource_permissions CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS role_permissions CASCADE;
-- DROP TABLE IF EXISTS customer_scopes CASCADE;
-- DROP TABLE IF EXISTS permissions CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP FUNCTION IF EXISTS user_has_permission CASCADE;
-- DROP FUNCTION IF EXISTS get_user_permissions CASCADE;
-- DROP FUNCTION IF EXISTS user_has_customer_scope CASCADE;
-- DROP FUNCTION IF EXISTS assign_user_role CASCADE;