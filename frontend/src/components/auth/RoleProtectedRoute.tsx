import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/UseAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Shield, Home } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  showUnauthorizedPage?: boolean;
}

/**
 * Comprehensive role-based route protection
 * - Validates user role and permissions
 * - Provides detailed unauthorized pages
 * - Handles all edge cases gracefully
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  requiredPermissions = [],
  fallbackPath = '/dashboard',
  showUnauthorizedPage = true
}) => {
  const { user, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // Show elegant loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <Card className="bg-gray-800 border-gray-700 w-96">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <div>
                <p className="text-white font-medium">Securing Your Access</p>
                <p className="text-gray-400 text-sm">Verifying your permissions...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if no user (should not happen with ProtectedRoute wrapper)
  if (!user) {
    console.warn('🚫 Route protection: No authenticated user, redirecting to login');
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check role access
  const hasRoleAccess = hasRole(allowedRoles);
  
  // Check permission access
  const hasAllPermissions = requiredPermissions.every(permission => 
    hasPermission(permission)
  );

  const hasAccess = hasRoleAccess && hasAllPermissions;

  // Access denied handling
  if (!hasAccess) {
    const currentPath = location.pathname;
    console.warn(`🚫 ACCESS DENIED: User ${user.email} (${user.role}) tried to access ${currentPath}`, {
      requiredRoles: allowedRoles,
      requiredPermissions,
      userRole: user.role,
      userPermissions: user.permissions
    });

    // Show detailed unauthorized page
    if (showUnauthorizedPage) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-10 w-10 text-red-500" />
              </div>
              <CardTitle className="text-white text-3xl">Access Restricted</CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                You don't have permission to access this section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Alert */}
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-red-300">
                  <strong className="text-white">{user.firstName} ({user.role})</strong> cannot access <strong className="text-white">{currentPath}</strong>
                </AlertDescription>
              </Alert>

              {/* Access Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-lg">Required Access</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-400">Roles:</span> <span className="text-white font-medium">{allowedRoles.join(', ') || 'Any role'}</span></p>
                    {requiredPermissions.length > 0 && (
                      <p><span className="text-gray-400">Permissions:</span> <span className="text-white font-medium">{requiredPermissions.join(', ')}</span></p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-lg">Your Access</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-400">Your Role:</span> <span className="text-blue-400 font-medium capitalize">{user.role}</span></p>
                    <p><span className="text-gray-400">Permissions:</span> <span className="text-green-400 font-medium">{user.permissions.length} granted</span></p>
                  </div>
                </div>
              </div>

              {/* Role-specific guidance */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Available to You:</h4>
                <p className="text-gray-400 text-sm">
                  {user.role === 'student' && 'As a student, you can access Courses, Grades, Attendance, and Payments.'}
                  {user.role === 'faculty' && 'As faculty, you can manage Classes, Grade Management, and Attendance Tracking.'}
                  {user.role === 'admin' && 'As admin, you have full system access including User Management and Reports.'}
                  {user.role === 'finance' && 'As finance staff, you can manage Invoices, Payment Tracking, and Financial Reports.'}
                  {user.role === 'parent' && 'As a parent, you can view Children, Academic Progress, and make Fee Payments.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700 h-12"
                >
                  ← Go Back
                </Button>
                <Button
                  onClick={() => window.location.href = fallbackPath}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Silent redirect fallback
    return <Navigate to={fallbackPath} replace />;
  }

  // Access granted - render protected content
  console.log(`✅ ACCESS GRANTED: User ${user.email} (${user.role}) accessing ${location.pathname}`);
  return <>{children}</>;
};

export default RoleProtectedRoute;