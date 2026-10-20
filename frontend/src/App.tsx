import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/UseAuth";
import AuthContainer from "@/components/auth/AuthContainer";
import AppLayout from "@/components/layout/AppLayout";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Notifications from "@/pages/Notifications";
import Courses from "@/pages/Courses";
import Grades from "@/pages/Grades";
import Settings from "@/pages/Settings";
import PaymentsMain from "@/pages/PaymentsMain";
import PaymentRedirect from "@/pages/PaymentRedirect";
import Attendance from "@/pages/Attendance";
import Children from "@/pages/parent/Children";
import FeePayments from "@/pages/parent/FeePayments";
import AcademicProgress from "@/pages/parent/AcademicProgress";
import MyClasses from "@/pages/faculty/MyClasses";
import GradeManagement from "@/pages/faculty/GradeManagement";
import AttendanceTracking from "@/pages/faculty/AttendanceTracking";
import Schedule from "@/pages/faculty/Schedule";
import UserManagement from "@/pages/admin/UserManagement";
import CourseManagement from "@/pages/admin/CourseManagement";
import DepartmentManagement from "@/pages/admin/DepartmentManagement";
import Reports from "@/pages/admin/Reports";
import InvoiceManagement from "@/pages/finance/InvoiceManagement";
import PaymentTracking from "@/pages/finance/PaymentTracking";
import FinancialReports from "@/pages/finance/FinancialReports";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// FIXED: Complete Protected Route with proper localStorage handling
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('🛡️ ProtectedRoute - Comprehensive authentication check:', { 
    user: user ? {
      email: user.email,
      role: user.role,
      userId: user.userId
    } : 'No user in state',
    isLoading: isLoading,
    currentPath: location.pathname,
    localStorageToken: localStorage.getItem('eduportal_token') ? 'PRESENT' : 'MISSING',
    localStorageUser: localStorage.getItem('eduportal_user') ? 'PRESENT' : 'MISSING',
    fullURL: window.location.href
  });
  
  // Enhanced loading state with detailed information
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium text-lg">Initializing EduPortal Security</p>
            <p className="text-gray-400 text-sm">Verifying your authentication credentials...</p>
            <p className="text-gray-500 text-xs">Path: {location.pathname}</p>
            <p className="text-gray-500 text-xs">Token in storage: {localStorage.getItem('eduportal_token') ? 'Yes' : 'No'}</p>
            <p className="text-gray-500 text-xs">User data in storage: {localStorage.getItem('eduportal_user') ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // CRITICAL FIX: Comprehensive authentication check
  const hasValidToken = !!localStorage.getItem('eduportal_token');
  const hasValidUser = !!localStorage.getItem('eduportal_user');
  const storedUser = localStorage.getItem('eduportal_user');
  
  console.log('🔍 ProtectedRoute - Final authentication decision:', {
    hasValidToken,
    hasValidUser,
    hasReactUser: !!user,
    storedUser: storedUser ? 'Present' : 'Missing'
  });

  // Allow access if ANY authentication evidence exists
  if (!user && !hasValidToken && !hasValidUser) {
    console.log('❌ ProtectedRoute - No authentication evidence found, redirecting to login');
    console.log('📋 Redirect details:', {
      from: location.pathname,
      state: { from: location },
      localStorageCheck: {
        token: localStorage.getItem('eduportal_token') ? 'EXISTS' : 'MISSING',
        user: localStorage.getItem('eduportal_user') ? 'EXISTS' : 'MISSING'
      },
      reactState: {
        user: user ? 'EXISTS' : 'MISSING'
      }
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // FIXED: If localStorage has auth data but React state doesn't, still allow access
  // This handles cases where the React state hasn't synced yet but we have valid auth data
  if (!user && (hasValidToken || hasValidUser)) {
    console.log('🔄 ProtectedRoute - Auth data in localStorage but not in React state, allowing access anyway');
    console.log('📦 localStorage data details:', {
      token: localStorage.getItem('eduportal_token') ? 'PRESENT (' + localStorage.getItem('eduportal_token')?.substring(0, 20) + '...)' : 'MISSING',
      user: localStorage.getItem('eduportal_user') ? 'PRESENT' : 'MISSING'
    });
    
    // Log the stored user details for debugging
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('👤 Stored user details:', {
          email: parsedUser.email,
          role: parsedUser.role,
          userId: parsedUser.userId
        });
      } catch (e) {
        console.error('❌ Failed to parse stored user:', e);
      }
    }
  }
  
  // FIXED: If we have React user state, log it
  if (user) {
    console.log('✅ ProtectedRoute - React user state confirmed:', {
      email: user.email,
      role: user.role,
      userId: user.userId,
      permissions: user.permissions?.length
    });
  }

  console.log('🛡️ ProtectedRoute - User authenticated successfully, granting access to:', location.pathname);
  console.log('🎯 Final authentication status:', {
    method: user ? 'React State' : 'LocalStorage',
    userEmail: user?.email || (storedUser ? JSON.parse(storedUser).email : 'Unknown'),
    userRole: user?.role || (storedUser ? JSON.parse(storedUser).role : 'Unknown')
  });
  
  return <>{children}</>;
};

// FIXED: Complete Public Route with proper authentication checks
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('🌐 PublicRoute - Comprehensive access check:', { 
    user: user ? {
      email: user.email,
      role: user.role,
      userId: user.userId
    } : 'No user in state',
    isLoading: isLoading,
    currentPath: location.pathname,
    localStorageToken: localStorage.getItem('eduportal_token') ? 'PRESENT' : 'MISSING',
    localStorageUser: localStorage.getItem('eduportal_user') ? 'PRESENT' : 'MISSING'
  });
  
  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium text-lg">Welcome to EduPortal</p>
            <p className="text-gray-400 text-sm">Preparing your access environment...</p>
            <p className="text-gray-500 text-xs">Checking authentication status...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // CRITICAL FIX: Comprehensive authenticated user detection
  const hasValidToken = !!localStorage.getItem('eduportal_token');
  const hasValidUser = !!localStorage.getItem('eduportal_user');
  const storedUser = localStorage.getItem('eduportal_user');
  
  console.log('🔍 PublicRoute - Authentication status check:', {
    hasValidToken,
    hasValidUser,
    hasReactUser: !!user,
    shouldRedirect: !!(user || (hasValidToken && hasValidUser))
  });

  // Only redirect if we have clear and unambiguous authentication evidence
  if (user || (hasValidToken && hasValidUser)) {
    console.log('🌐 PublicRoute - User already authenticated, redirecting to dashboard');
    console.log('🔍 Redirect details:', {
      user: user?.email || (storedUser ? JSON.parse(storedUser).email : 'from-storage'),
      role: user?.role || (storedUser ? JSON.parse(storedUser).role : 'unknown'),
      from: location.pathname,
      to: '/dashboard',
      authenticationSource: user ? 'React State' : 'LocalStorage'
    });
    
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('🌐 PublicRoute - User not authenticated, showing public content');
  console.log('🔍 Public access granted for:', location.pathname);
  
  return <>{children}</>;
};

// FIXED: Enhanced Route Debugger with comprehensive logging
const RouteDebugger = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('🔍 RouteDebugger - Comprehensive state analysis:', {
      currentPath: location.pathname,
      user: user ? {
        email: user.email,
        role: user.role,
        isDemo: user.isDemo,
        permissions: user.permissions,
        userId: user.userId
      } : 'No user in React state',
      isLoading: isLoading,
      localStorage: {
        token: localStorage.getItem('eduportal_token') ? 'PRESENT (' + localStorage.getItem('eduportal_token')?.substring(0, 20) + '...)' : 'MISSING',
        user: localStorage.getItem('eduportal_user') ? 'PRESENT' : 'MISSING'
      },
      fullURL: window.location.href,
      timestamp: new Date().toISOString(),
      routeState: location.state
    });

    // Enhanced auto-redirect logic
    const token = localStorage.getItem('eduportal_token');
    const storedUser = localStorage.getItem('eduportal_user');
    
    // Only auto-redirect if we have clear authentication evidence
    if ((user || (token && storedUser)) && location.pathname === '/login') {
      console.log('🔄 RouteDebugger - Auto-redirecting authenticated user from login to dashboard');
      console.log('📋 Redirect details:', {
        hasReactUser: !!user,
        hasLocalStorageToken: !!token,
        hasLocalStorageUser: !!storedUser,
        currentPath: location.pathname,
        targetPath: '/dashboard'
      });
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, isLoading, navigate, location.state]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RouteDebugger />
          <div className="min-h-screen bg-black text-white">
            <Routes>
              {/* Public routes - Only accessible when not authenticated */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <AuthContainer />
                  </PublicRoute>
                } 
              />
              
              {/* Root path redirects to login */}
              <Route 
                path="/" 
                element={<Navigate to="/login" replace />} 
              />
              
              {/* Protected routes with comprehensive role-based access */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* ======================= */}
                {/* COMMON ROUTES - ACCESSIBLE TO ALL ROLES */}
                {/* ======================= */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />

                {/* ==================== */}
                {/* STUDENT-ONLY ROUTES */}
                {/* ==================== */}
                <Route path="courses" element={
                  <RoleProtectedRoute 
                    allowedRoles={['student']}
                    requiredPermissions={['view_courses']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <Courses />
                  </RoleProtectedRoute>
                } />
                <Route path="grades" element={
                  <RoleProtectedRoute 
                    allowedRoles={['student']}
                    requiredPermissions={['view_grades']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <Grades />
                  </RoleProtectedRoute>
                } />
                <Route path="attendance" element={
                  <RoleProtectedRoute 
                    allowedRoles={['student']}
                    requiredPermissions={['view_attendance']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <Attendance />
                  </RoleProtectedRoute>
                } />
                <Route path="payments" element={
                  <RoleProtectedRoute 
                    allowedRoles={['student']}
                    requiredPermissions={['make_payments']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <PaymentsMain />
                  </RoleProtectedRoute>
                } />
                <Route path="payment-redirect" element={
                  <RoleProtectedRoute 
                    allowedRoles={['student']}
                    requiredPermissions={['make_payments']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <PaymentRedirect />
                  </RoleProtectedRoute>
                } />

                {/* ==================== */}
                {/* FACULTY-ONLY ROUTES */}
                {/* ==================== */}
                <Route path="classes" element={
                  <RoleProtectedRoute 
                    allowedRoles={['faculty']}
                    requiredPermissions={['manage_classes']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <MyClasses />
                  </RoleProtectedRoute>
                } />
                <Route path="grade-management" element={
                  <RoleProtectedRoute 
                    allowedRoles={['faculty']}
                    requiredPermissions={['manage_grades']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <GradeManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="attendance-tracking" element={
                  <RoleProtectedRoute 
                    allowedRoles={['faculty']}
                    requiredPermissions={['track_attendance']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <AttendanceTracking />
                  </RoleProtectedRoute>
                } />
                <Route path="schedule" element={
                  <RoleProtectedRoute 
                    allowedRoles={['faculty']}
                    requiredPermissions={['view_schedule']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <Schedule />
                  </RoleProtectedRoute>
                } />

                {/* ================= */}
                {/* ADMIN-ONLY ROUTES */}
                {/* ================= */}
                <Route path="users" element={
                  <RoleProtectedRoute 
                    allowedRoles={['admin']}
                    requiredPermissions={['manage_users']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <UserManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="course-management" element={
                  <RoleProtectedRoute 
                    allowedRoles={['admin']}
                    requiredPermissions={['manage_courses']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <CourseManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="departments" element={
                  <RoleProtectedRoute 
                    allowedRoles={['admin']}
                    requiredPermissions={['manage_departments']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <DepartmentManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="reports" element={
                  <RoleProtectedRoute 
                    allowedRoles={['admin']}
                    requiredPermissions={['view_reports']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <Reports />
                  </RoleProtectedRoute>
                } />

                {/* ==================== */}
                {/* FINANCE-ONLY ROUTES */}
                {/* ==================== */}
                <Route path="invoices" element={
                  <RoleProtectedRoute 
                    allowedRoles={['finance']}
                    requiredPermissions={['manage_invoices']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <InvoiceManagement />
                  </RoleProtectedRoute>
                } />
                <Route path="payment-tracking" element={
                  <RoleProtectedRoute 
                    allowedRoles={['finance']}
                    requiredPermissions={['track_payments']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <PaymentTracking />
                  </RoleProtectedRoute>
                } />
                <Route path="financial-reports" element={
                  <RoleProtectedRoute 
                    allowedRoles={['finance']}
                    requiredPermissions={['view_financial_reports']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <FinancialReports />
                  </RoleProtectedRoute>
                } />

                {/* ================== */}
                {/* PARENT-ONLY ROUTES */}
                {/* ================== */}
                <Route path="children" element={
                  <RoleProtectedRoute 
                    allowedRoles={['parent']}
                    requiredPermissions={['view_children']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <Children />
                  </RoleProtectedRoute>
                } />
                <Route path="progress" element={
                  <RoleProtectedRoute 
                    allowedRoles={['parent']}
                    requiredPermissions={['view_progress']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <AcademicProgress />
                  </RoleProtectedRoute>
                } />
                <Route path="fee-payments" element={
                  <RoleProtectedRoute 
                    allowedRoles={['parent']}
                    requiredPermissions={['make_payments']}
                    fallbackPath="/dashboard"
                    showUnauthorizedPage={true}
                  >
                    <FeePayments />
                  </RoleProtectedRoute>
                } />
                
                {/* Default redirect to dashboard for authenticated users */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 - Not Found Page */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;