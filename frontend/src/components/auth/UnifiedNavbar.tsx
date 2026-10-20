import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { User, AuthContextType, StoredUserData, ApiError } from '@/types/Auth';
import { DEMO_ACCOUNTS } from '@/constants/demoAccounts';
import { ROLE_PERMISSIONS } from '@/constants/permissions';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced Auth Provider with comprehensive debugging
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔄 AuthContext - User state changed:', user ? `Logged in as ${user.email}` : 'No user');
  }, [user]);

  const validateStoredUser = (storedUser: StoredUserData): User | null => {
    try {
      console.log('🔍 Validating stored user data:', storedUser);
      
      if (!storedUser || !storedUser.email || !storedUser.role) {
        console.log('❌ Invalid stored user - missing required fields');
        return null;
      }

      const requiredFields = ['userId', 'email', 'role', 'firstName', 'lastName'];
      const missingFields = requiredFields.filter(field => !storedUser[field as keyof StoredUserData]);
      
      if (missingFields.length > 0) {
        console.warn('❌ Invalid stored user data - missing fields:', missingFields);
        return null;
      }

      // Validate role
      const validRoles = ['student', 'faculty', 'admin', 'finance', 'parent'];
      if (!validRoles.includes(storedUser.role)) {
        console.warn('❌ Invalid user role:', storedUser.role);
        return null;
      }

      const validatedUser: User = {
        userId: storedUser.userId!,
        email: storedUser.email!,
        role: storedUser.role as User['role'],
        firstName: storedUser.firstName!,
        lastName: storedUser.lastName!,
        studentId: storedUser.studentId,
        facultyId: storedUser.facultyId,
        department: storedUser.department,
        programName: storedUser.programName,
        admissionYear: storedUser.admissionYear,
        permissions: ROLE_PERMISSIONS[storedUser.role as keyof typeof ROLE_PERMISSIONS] || [],
        lastLogin: storedUser.lastLogin || new Date().toISOString(),
        isDemo: storedUser.isDemo || false
      };

      console.log('✅ User validation successful:', validatedUser.email);
      return validatedUser;
    } catch (error) {
      console.error('❌ Error validating stored user:', error);
      return null;
    }
  };

  // Enhanced initialization with comprehensive debugging
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 [AuthContext] === AUTH INITIALIZATION STARTED ===');
      try {
        const token = localStorage.getItem('eduportal_token');
        const storedUser = localStorage.getItem('eduportal_user');

        console.log('📦 [DEBUG] Storage check - Raw values:', {
          token: token ? `PRESENT (${token.substring(0, 20)}...)` : 'MISSING',
          user: storedUser ? `PRESENT (${storedUser.substring(0, 50)}...)` : 'MISSING'
        });

        if (token && storedUser) {
          console.log('✅ [DEBUG] Both token and user found in storage');
          const parsedUser: StoredUserData = JSON.parse(storedUser);
          console.log('👤 [DEBUG] Parsed stored user:', parsedUser);
          
          // For demo accounts, skip API validation
          if (parsedUser.isDemo) {
            console.log('🎯 [DEBUG] Demo account detected in storage');
            const validatedUser = validateStoredUser(parsedUser);
            if (validatedUser) {
              console.log('✅ [DEBUG] Setting user state from validated demo user');
              setUser(validatedUser);
              console.log('✅ Demo user authenticated from storage:', validatedUser.email);
            } else {
              console.log('🔒 [DEBUG] Invalid demo user data, clearing storage');
              localStorage.removeItem('eduportal_token');
              localStorage.removeItem('eduportal_user');
              setUser(null);
            }
          } else {
            // For real accounts, validate token with backend
            console.log('🔐 [DEBUG] Real account detected, validating token with backend');
            try {
              const validationResult = await api.validateToken();
              console.log('🔐 [DEBUG] Token validation result:', validationResult);
              
              if (validationResult.success && validationResult.user) {
                console.log('✅ [DEBUG] Token validation successful');
                const validatedUser: User = {
                  ...validationResult.user,
                  permissions: ROLE_PERMISSIONS[validationResult.user.role as keyof typeof ROLE_PERMISSIONS] || [],
                  lastLogin: new Date().toISOString(),
                  isDemo: false
                };
                setUser(validatedUser);
                localStorage.setItem('eduportal_user', JSON.stringify(validatedUser));
                console.log('✅ User session restored and validated');
              } else {
                console.log('❌ [DEBUG] Token validation failed, clearing storage');
                localStorage.removeItem('eduportal_token');
                localStorage.removeItem('eduportal_user');
                setUser(null);
              }
            } catch (validationError) {
              console.error('❌ [DEBUG] Token validation error:', validationError);
              console.log('⚠️ [DEBUG] Backend validation failed, but keeping stored user data');
              const validatedUser = validateStoredUser(parsedUser);
              if (validatedUser) {
                setUser(validatedUser);
                console.log('✅ Using stored user data despite backend error:', validatedUser.email);
              }
            }
          }
        } else {
          console.log('🔒 [DEBUG] No valid authentication found in storage - details:', {
            hasToken: !!token,
            hasUser: !!storedUser,
            tokenValue: token,
            userValue: storedUser
          });
          setUser(null);
        }
      } catch (error) {
        console.error('❌ [DEBUG] Auth initialization error:', error);
        // Clear corrupted data
        localStorage.removeItem('eduportal_token');
        localStorage.removeItem('eduportal_user');
        setUser(null);
      } finally {
        console.log('🏁 [DEBUG] Auth initialization complete, setting isLoading to false');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    console.log('🔐 [DEBUG] === LOGIN PROCESS STARTED ===', { email });
    
    try {
      // Demo account authentication
      console.log('🔍 [DEBUG] Checking demo accounts...');
      const demoAccount = DEMO_ACCOUNTS.find(acc => 
        acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
      );

      if (demoAccount) {
        console.log('🎯 [DEBUG] DEMO ACCOUNT FOUND:', demoAccount.email);
        console.log('🎯 [DEBUG] Step 1 - Demo account authenticated');
        
        const userData: User = {
          userId: demoAccount.email === 'student@university.edu' ? 1001 : 
                  demoAccount.email === 'faculty@university.edu' ? 2001 :
                  demoAccount.email === 'admin@university.edu' ? 3001 :
                  demoAccount.email === 'finance@university.edu' ? 4001 : 
                  demoAccount.email === 'parent@university.edu' ? 5001 : 5002,
          email: demoAccount.email,
          role: demoAccount.role,
          firstName: demoAccount.firstName,
          lastName: demoAccount.lastName,
          studentId: demoAccount.studentId,
          facultyId: demoAccount.facultyId,
          department: demoAccount.department,
          programName: demoAccount.programName,
          admissionYear: demoAccount.admissionYear,
          permissions: ROLE_PERMISSIONS[demoAccount.role],
          lastLogin: new Date().toISOString(),
          isDemo: true
        };

        console.log('💾 [DEBUG] Step 2 - User data created:', userData);

        // STEP 3: Save to localStorage
        console.log('💾 [DEBUG] Step 3 - Saving to localStorage...');
        try {
          const token = `demo-token-${Date.now()}`;
          localStorage.setItem('eduportal_token', token);
          localStorage.setItem('eduportal_user', JSON.stringify(userData));
          console.log('✅ [DEBUG] localStorage.setItem completed');
        } catch (storageError) {
          console.error('❌ [DEBUG] localStorage.setItem failed:', storageError);
          return { success: false, message: 'Failed to save login data' };
        }
        
        // STEP 4: Verify storage immediately
        console.log('💾 [DEBUG] Step 4 - Verifying storage...');
        const storedToken = localStorage.getItem('eduportal_token');
        const storedUser = localStorage.getItem('eduportal_user');
        console.log('💾 [DEBUG] Storage verification result:', {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
          tokenLength: storedToken?.length,
          userLength: storedUser?.length
        });

        if (!storedToken || !storedUser) {
          console.error('❌ [DEBUG] STORAGE FAILED - tokens not persisted');
          return { success: false, message: 'Login data not saved properly' };
        }

        // STEP 5: Set React state
        console.log('⚛️ [DEBUG] Step 5 - Setting React state...');
        try {
          setUser(userData);
          console.log('✅ [DEBUG] setUser() called successfully');
        } catch (stateError) {
          console.error('❌ [DEBUG] setUser() failed:', stateError);
          return { success: false, message: 'Failed to update application state' };
        }

        // STEP 6: Navigate immediately after state update
        console.log('🔄 [DEBUG] Step 6 - Navigating to dashboard...');
        try {
          navigate('/dashboard', { replace: true });
          console.log('✅ [DEBUG] navigate() command sent successfully');
        } catch (navError) {
          console.error('❌ [DEBUG] navigate() failed:', navError);
          return { success: false, message: 'Navigation failed' };
        }

        console.log('✅ [DEBUG] === LOGIN PROCESS COMPLETED ===');
        return { success: true, message: `Welcome to ${demoAccount.name}` };
      }

      console.log('❌ [DEBUG] No demo account matched credentials');
      console.log('🌐 [DEBUG] Attempting API authentication...');
      
      // Regular API authentication
      const result = await api.login(email, password);
      console.log('🔐 [DEBUG] API login result:', result);
      
      if (result.success && result.user && result.token) {
        // Save real user data
        localStorage.setItem('eduportal_token', result.token);
        localStorage.setItem('eduportal_user', JSON.stringify(result.user));
        setUser(result.user);
        navigate('/dashboard', { replace: true });
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }

    } catch (error: unknown) {
      console.error('❌ [DEBUG] LOGIN PROCESS CRASHED:', error);
      return { success: false, message: 'Login process failed' };
    }
  };

  const logout = () => {
    console.log('🚪 [DEBUG] === LOGOUT PROCESS STARTED ===');
    const userEmail = user?.email;
    
    console.log('🗑️ [DEBUG] Step 1 - Clearing React state');
    setUser(null);
    
    console.log('🗑️ [DEBUG] Step 2 - Clearing localStorage');
    localStorage.removeItem('eduportal_token');
    localStorage.removeItem('eduportal_user');
    
    // Verify storage is cleared
    const tokenAfter = localStorage.getItem('eduportal_token');
    const userAfter = localStorage.getItem('eduportal_user');
    console.log('🗑️ [DEBUG] Step 3 - Storage after clear:', {
      token: tokenAfter ? 'STILL EXISTS' : 'CLEARED',
      user: userAfter ? 'STILL EXISTS' : 'CLEARED'
    });
    
    console.log('🔄 [DEBUG] Step 4 - Navigating to login page');
    navigate('/login', { replace: true });
    
    console.log('✅ [DEBUG] Step 5 - Logout complete for user:', userEmail);
  };

  const hasPermission = (permission: string): boolean => {
    const hasPerm = user?.permissions?.includes(permission) || false;
    console.log(`🔐 Permission check: ${permission} -> ${hasPerm ? 'GRANTED' : 'DENIED'}`);
    return hasPerm;
  };

  const hasRole = (roles: string | string[]): boolean => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const hasRoleAccess = roleArray.includes(user?.role || '');
    console.log(`👤 Role check: ${roleArray.join(', ')} -> ${hasRoleAccess ? 'GRANTED' : 'DENIED'}`);
    return hasRoleAccess;
  };

  // Create context value with ALL required properties
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

  console.log('🔄 AuthContext rendering with user:', user ? user.email : 'null');

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export ONLY the component (no hook exports) - CORRECT!
export { AuthContext, AuthProvider };