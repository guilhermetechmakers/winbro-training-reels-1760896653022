import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useCurrentUser, useSignOut, useAuthStateChange } from '@/hooks/useAuth';
import type { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => void;
  hasRole: (roleName: string, scope?: string) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  // Enhanced authentication features
  organization: any | null;
  refreshUser: () => void;
  updateUserProfile: (updates: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  enable2FA: () => Promise<void>;
  disable2FA: () => Promise<void>;
  revokeAllSessions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, refetch } = useCurrentUser();
  const signOutMutation = useSignOut();
  const [isInitialized, setIsInitialized] = useState(false);

  // Listen to auth state changes
  useAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      refetch();
    }
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refetch();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [refetch]);

  const signOut = () => {
    signOutMutation.mutate();
  };

  const hasRole = (roleName: string, scope?: string): boolean => {
    if (!user?.roles) return false;
    
    return user.roles.some(role => 
      role.role_name === roleName && 
      role.is_active && 
      (!scope || role.scope === scope)
    );
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user?.roles) return false;
    
    return user.roles.some(role => {
      if (!role.is_active) return false;
      
      const permissions = role.permissions as Record<string, any>;
      return permissions[resource]?.includes(action) || permissions[resource]?.includes('*');
    });
  };

  const refreshUser = () => {
    refetch();
  };

  const updateUserProfile = async (updates: any) => {
    // TODO: Implement user profile update
    console.log('Update user profile:', updates);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // TODO: Implement password change
    console.log('Change password:', { currentPassword, newPassword });
  };

  const enable2FA = async () => {
    // TODO: Implement 2FA enable
    console.log('Enable 2FA');
  };

  const disable2FA = async () => {
    // TODO: Implement 2FA disable
    console.log('Disable 2FA');
  };

  const revokeAllSessions = async () => {
    // TODO: Implement revoke all sessions
    console.log('Revoke all sessions');
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
    signOut,
    hasRole,
    hasPermission,
    organization: null, // TODO: Get organization from user context
    refreshUser,
    updateUserProfile,
    changePassword,
    enable2FA,
    disable2FA,
    revokeAllSessions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}