// src/hooks/UseAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { AuthContextType } from '@/types/Auth';

// useAuth hook - WITH PROPER HELPER FUNCTIONS
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Add proper implementation of hasRole function
  const hasRole = (roles: string | string[]): boolean => {
    if (!context.user) return false;
    
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(context.user.role);
  };

  // Add proper implementation of hasPermission function
  const hasPermission = (permission: string): boolean => {
    if (!context.user || !context.user.permissions) return false;
    return context.user.permissions.includes(permission);
  };

  return {
    ...context,
    hasRole,
    hasPermission,
    currentUser: context.user // Add currentUser alias
  };
};

export default useAuth;