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

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
    signOut,
    hasRole,
    hasPermission,
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