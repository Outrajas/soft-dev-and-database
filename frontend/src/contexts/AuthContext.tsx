import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { User, AuthContextType, StoredUserData } from '@/types/Auth';
import { DEMO_ACCOUNTS } from '@/constants/demoAccounts';
import { ROLE_PERMISSIONS } from '@/constants/permissions';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Enhanced user state logging - only log when user actually changes
  useEffect(() => {
    if (isInitialized) {
      console.log('🔄 AuthContext - User state updated:', 
        user ? `Authenticated as ${user.email} (${user.role})` : 'No user'
      );
    }
  }, [user, isInitialized]);

  // Simplified user validation
  const validateStoredUser = (storedUser: StoredUserData): User | null => {
    try {
      if (!storedUser?.email || !storedUser?.role) {
        console.warn('❌ Invalid stored user data');
        return null;
      }

      const validatedUser: User = {
        userId: storedUser.userId || 0,
        email: storedUser.email,
        role: storedUser.role as User['role'],
        firstName: storedUser.firstName || 'User',
        lastName: storedUser.lastName || 'Unknown',
        studentId: storedUser.studentId,
        facultyId: storedUser.facultyId,
        department: storedUser.department,
        programName: storedUser.programName,
        admissionYear: storedUser.admissionYear,
        permissions: ROLE_PERMISSIONS[storedUser.role as keyof typeof ROLE_PERMISSIONS] || [],
        lastLogin: storedUser.lastLogin || new Date().toISOString(),
        isDemo: storedUser.isDemo || false
      };

      console.log('✅ User validation successful for:', validatedUser.email);
      return validatedUser;
    } catch (error) {
      console.error('❌ Error validating stored user:', error);
      return null;
    }
  };

  // Enhanced authentication initialization
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AuthContext - Initializing authentication...');
      try {
        setIsLoading(true);
        const token = localStorage.getItem('eduportal_token');
        const storedUser = localStorage.getItem('eduportal_user');

        console.log('📦 Storage check - Token:', token ? 'Present' : 'Missing', 'User:', storedUser ? 'Present' : 'Missing');

        if (token && storedUser) {
          const parsedUser: StoredUserData = JSON.parse(storedUser);
          
          // For demo accounts, skip backend validation
          if (parsedUser.isDemo) {
            console.log('🎯 Demo account detected');
            const validatedUser = validateStoredUser(parsedUser);
            if (validatedUser) {
              setUser(validatedUser);
              console.log('✅ Demo user restored:', validatedUser.email);
            } else {
              console.warn('❌ Invalid demo user data, clearing storage');
              localStorage.removeItem('eduportal_token');
              localStorage.removeItem('eduportal_user');
              setUser(null);
            }
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }

          // Real account - validate with backend
          console.log('🔐 Real account detected, validating with backend...');
          try {
            const validationResult = await api.validateToken();
            
            if (validationResult.success && validationResult.user) {
              console.log('✅ Backend token validation successful');
              const validatedUser: User = {
                ...validationResult.user,
                permissions: ROLE_PERMISSIONS[validationResult.user.role as keyof typeof ROLE_PERMISSIONS] || [],
                lastLogin: new Date().toISOString(),
                isDemo: false
              };
              setUser(validatedUser);
              localStorage.setItem('eduportal_user', JSON.stringify(validatedUser));
              console.log('✅ User session restored');
            } else {
              console.warn('❌ Backend token validation failed');
              // Try using stored data as fallback
              const validatedUser = validateStoredUser(parsedUser);
              if (validatedUser) {
                setUser(validatedUser);
                console.log('✅ Using stored user data as fallback');
              } else {
                localStorage.removeItem('eduportal_token');
                localStorage.removeItem('eduportal_user');
                setUser(null);
              }
            }
          } catch (validationError) {
            console.error('❌ Backend validation error:', validationError);
            // Use stored data as fallback
            const validatedUser = validateStoredUser(parsedUser);
            if (validatedUser) {
              setUser(validatedUser);
              console.log('✅ Using stored user data despite backend error');
            } else {
              localStorage.removeItem('eduportal_token');
              localStorage.removeItem('eduportal_user');
              setUser(null);
            }
          }
        } else {
          console.log('🔒 No authentication data found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Critical auth initialization error:', error);
        localStorage.removeItem('eduportal_token');
        localStorage.removeItem('eduportal_user');
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('🏁 Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Enhanced login function with proper localStorage storage and navigation
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    console.log('🔐 Login process initiated for:', email);
    
    try {
      const result = await api.login(email, password);
      console.log('🔐 Login API response:', result);
      
      if (result.success && result.user && result.token) {
        console.log('✅ Login successful - storing auth data');
        
        // Store auth data
        localStorage.setItem('eduportal_token', result.token);
        localStorage.setItem('eduportal_user', JSON.stringify(result.user));
        
        // Verify storage
        const storedToken = localStorage.getItem('eduportal_token');
        const storedUser = localStorage.getItem('eduportal_user');
        
        console.log('🔍 Storage verification:', {
          tokenStored: !!storedToken,
          userStored: !!storedUser,
          token: storedToken ? 'Present' : 'Missing',
          user: storedUser ? 'Present' : 'Missing'
        });

        if (!storedToken || !storedUser) {
          console.error('❌ CRITICAL: Auth data not stored in localStorage');
          return { 
            success: false, 
            message: 'Authentication failed: Could not save session data' 
          };
        }

        // Update React state
        setUser(result.user);
        
        console.log('✅ Auth state updated, preparing navigation...');
        
        // Use setTimeout to ensure state update and allow React to re-render
        setTimeout(() => {
          console.log('🚀 Navigating to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 50);
        
        return { success: true, message: result.message };
      } else {
        console.error('❌ Login failed:', result.message);
        return { success: false, message: result.message || 'Authentication failed' };
      }
    } catch (error) {
      console.error('❌ Critical login error:', error);
      return { success: false, message: 'Login process encountered an unexpected error' };
    }
  };

  // Enhanced logout function
  const logout = () => {
    console.log('🚪 Logout process initiated...');
    const userEmail = user?.email;
    
    // Clear state
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('eduportal_token');
    localStorage.removeItem('eduportal_user');
    
    // Navigate to login
    navigate('/login', { replace: true });
    console.log(`✅ Logout completed for: ${userEmail}`);
  };

  // Permission checking
  const hasPermission = (permission: string): boolean => {
    const hasPerm = user?.permissions?.includes(permission) || false;
    return hasPerm;
  };

  // Role checking
  const hasRole = (roles: string | string[]): boolean => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user?.role || '');
  };

  // Context value
  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    hasRole,
    currentUser: user,
    demoAccounts: DEMO_ACCOUNTS
  };

  // Only log rendering in development and when initialized
  if (process.env.NODE_ENV === 'development' && isInitialized) {
    console.log('🔄 AuthContext rendering with user:', user ? `${user.email} (${user.role})` : 'null');
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };