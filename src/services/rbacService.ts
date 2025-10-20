/**
 * RBAC Service for Winbro Training Reels
 * Handles role-based access control and permissions
 */

import { supabase } from '@/lib/supabase';
// import type { Database } from '@/lib/supabase';

// Database types - these tables don't exist yet
type Role = any;
type Permission = any;
// type UserRole = any;

export interface UserPermission {
  permissionName: string;
  resourceType: string;
  scope: string;
  grantedVia: 'direct' | 'role';
  expiresAt: string | null;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserWithRoles {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
  permissions: UserPermission[];
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  grantedVia?: 'direct' | 'role';
  expiresAt?: string | null;
}

export class RBACService {
  private static instance: RBACService;
  private permissionCache = new Map<string, { permissions: UserPermission[]; expires: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  /**
   * Check if user has specific permission
   */
  public async checkPermission(
    userId: string,
    permissionName: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<PermissionCheck> {
    try {
      const { data, error } = await supabase.rpc('user_has_permission', {
        p_user_id: userId,
        p_permission_name: permissionName,
        p_resource_type: resourceType || null,
        p_resource_id: resourceId || null
      });

      if (error) {
        console.error('Failed to check permission:', error);
        return { hasPermission: false, reason: 'Permission check failed' };
      }

      return { hasPermission: data };
    } catch (error) {
      console.error('Permission check failed:', error);
      return { hasPermission: false, reason: 'Permission check error' };
    }
  }

  /**
   * Get all permissions for user
   */
  public async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      // Check cache first
      const cached = this.permissionCache.get(userId);
      if (cached && cached.expires > Date.now()) {
        return cached.permissions;
      }

      const { data, error } = await supabase.rpc('get_user_permissions', {
        p_user_id: userId
      });

      if (error) {
        console.error('Failed to get user permissions:', error);
        throw error;
      }

      const permissions = data || [];

      // Cache the result
      this.permissionCache.set(userId, {
        permissions,
        expires: Date.now() + this.CACHE_TTL
      });

      return permissions;
    } catch (error) {
      console.error('Get user permissions failed:', error);
      throw error;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  public async hasAnyPermission(
    userId: string,
    permissions: string[],
    resourceType?: string
  ): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      
      return permissions.some(permission => 
        userPermissions.some(userPerm => 
          userPerm.permissionName === permission &&
          (resourceType ? userPerm.resourceType === resourceType : true) &&
          (!userPerm.expiresAt || new Date(userPerm.expiresAt) > new Date())
        )
      );
    } catch (error) {
      console.error('Has any permission check failed:', error);
      return false;
    }
  }

  /**
   * Check if user has all of the specified permissions
   */
  public async hasAllPermissions(
    userId: string,
    permissions: string[],
    resourceType?: string
  ): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      
      return permissions.every(permission => 
        userPermissions.some(userPerm => 
          userPerm.permissionName === permission &&
          (resourceType ? userPerm.resourceType === resourceType : true) &&
          (!userPerm.expiresAt || new Date(userPerm.expiresAt) > new Date())
        )
      );
    } catch (error) {
      console.error('Has all permissions check failed:', error);
      return false;
    }
  }

  /**
   * Check customer scope access
   */
  public async hasCustomerScope(
    userId: string,
    customerId: string,
    scopeType?: string,
    scopeValue?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_has_customer_scope', {
        p_user_id: userId,
        p_customer_id: customerId,
        p_scope_type: scopeType || null,
        p_scope_value: scopeValue || null
      });

      if (error) {
        console.error('Failed to check customer scope:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Customer scope check failed:', error);
      return false;
    }
  }

  /**
   * Get all roles
   */
  public async getRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: false });

      if (error) {
        console.error('Failed to get roles:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get roles failed:', error);
      throw error;
    }
  }

  /**
   * Get role with permissions
   */
  public async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | null> {
    try {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (roleError) {
        console.error('Failed to get role:', roleError);
        throw roleError;
      }

      const { data: permissions, error: permissionsError } = await supabase
        .from('role_permissions')
        .select(`
          permission:permissions(*)
        `)
        .eq('role_id', roleId)
        .eq('is_active', true);

      if (permissionsError) {
        console.error('Failed to get role permissions:', permissionsError);
        throw permissionsError;
      }

      return {
        ...role,
        permissions: permissions?.map(p => p.permission).filter(Boolean) || []
      };
    } catch (error) {
      console.error('Get role with permissions failed:', error);
      throw error;
    }
  }

  /**
   * Get user with roles and permissions
   */
  public async getUserWithRoles(userId: string): Promise<UserWithRoles | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Failed to get user:', userError);
        throw userError;
      }

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role:roles(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (rolesError) {
        console.error('Failed to get user roles:', rolesError);
        throw rolesError;
      }

      const roles = userRoles?.map(ur => ur.role).filter(Boolean) || [];
      const permissions = await this.getUserPermissions(userId);

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roles,
        permissions
      };
    } catch (error) {
      console.error('Get user with roles failed:', error);
      throw error;
    }
  }

  /**
   * Assign role to user
   */
  public async assignRole(
    userId: string,
    roleName: string,
    assignedBy: string,
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('assign_user_role', {
        p_user_id: userId,
        p_role_name: roleName,
        p_assigned_by: assignedBy,
        p_expires_at: expiresAt?.toISOString() || null
      });

      if (error) {
        console.error('Failed to assign role:', error);
        throw error;
      }

      // Clear user permission cache
      this.permissionCache.delete(userId);

      return data;
    } catch (error) {
      console.error('Assign role failed:', error);
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  public async removeRole(userId: string, roleName: string): Promise<void> {
    try {
      // Get role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError) {
        console.error('Failed to get role:', roleError);
        throw roleError;
      }

      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role_id', role.id);

      if (error) {
        console.error('Failed to remove role:', error);
        throw error;
      }

      // Clear user permission cache
      this.permissionCache.delete(userId);
    } catch (error) {
      console.error('Remove role failed:', error);
      throw error;
    }
  }

  /**
   * Create custom role
   */
  public async createRole(
    name: string,
    displayName: string,
    description: string,
    level: number,
    permissionIds: string[]
  ): Promise<Role> {
    try {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({
          name,
          display_name: displayName,
          description,
          level,
          is_system_role: false
        })
        .select()
        .single();

      if (roleError) {
        console.error('Failed to create role:', roleError);
        throw roleError;
      }

      // Assign permissions to role
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          role_id: role.id,
          permission_id: permissionId
        }));

        const { error: permissionsError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (permissionsError) {
          console.error('Failed to assign permissions to role:', permissionsError);
          throw permissionsError;
        }
      }

      return role;
    } catch (error) {
      console.error('Create role failed:', error);
      throw error;
    }
  }

  /**
   * Update role permissions
   */
  public async updateRolePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<void> {
    try {
      // Remove existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) {
        console.error('Failed to remove existing permissions:', deleteError);
        throw deleteError;
      }

      // Add new permissions
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId
        }));

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (insertError) {
          console.error('Failed to assign new permissions:', insertError);
          throw insertError;
        }
      }

      // Clear all user permission caches since role permissions changed
      this.permissionCache.clear();
    } catch (error) {
      console.error('Update role permissions failed:', error);
      throw error;
    }
  }

  /**
   * Get all permissions
   */
  public async getPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('is_active', true)
        .order('resource_type', { ascending: true })
        .order('action', { ascending: true });

      if (error) {
        console.error('Failed to get permissions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get permissions failed:', error);
      throw error;
    }
  }

  /**
   * Check if user is admin
   */
  public async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }

      return user.role === 'admin' || user.role === 'super_admin';
    } catch (error) {
      console.error('Admin check failed:', error);
      return false;
    }
  }

  /**
   * Check if user is super admin
   */
  public async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to check super admin status:', error);
        return false;
      }

      return user.role === 'super_admin';
    } catch (error) {
      console.error('Super admin check failed:', error);
      return false;
    }
  }

  /**
   * Clear permission cache for user
   */
  public clearUserCache(userId: string): void {
    this.permissionCache.delete(userId);
  }

  /**
   * Clear all permission caches
   */
  public clearAllCaches(): void {
    this.permissionCache.clear();
  }
}

// Export singleton instance
export const rbacService = RBACService.getInstance();