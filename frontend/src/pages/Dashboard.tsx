import React from 'react';
import { useAuth } from '@/hooks/UseAuth';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import FacultyDashboard from '@/components/dashboards/FacultyDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import FinanceDashboard from '@/components/dashboards/FinanceDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, BookOpen, CreditCard, BarChart3, GraduationCap } from 'lucide-react';
import { User } from '@/types/Auth';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Please log in to view your dashboard</p>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (user.role) {
    case 'student':
      return <StudentDashboard user={user} />;
    case 'faculty':
      return <FacultyDashboard user={user} />;
    case 'admin':
      return <AdminDashboard user={user} />;
    case 'finance':
      return <FinanceDashboard user={user} />;
    case 'parent':
      return <ParentDashboard user={user} />;
    default:
      return <GenericDashboard user={user} />;
  }
};

// Fallback generic dashboard
const GenericDashboard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Welcome to EduPortal</h1>
        <p className="text-gray-400">
          {user.firstName} {user.lastName} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Account</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{user.role}</div>
            <p className="text-xs text-gray-400">Account Type</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Status</CardTitle>
            <BookOpen className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Active</div>
            <p className="text-xs text-gray-400">Account Status</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">System</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Online</div>
            <p className="text-xs text-gray-400">Platform Status</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            <span>Welcome to EduPortal</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your personalized educational management platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Welcome, <strong>{user.firstName} {user.lastName}</strong>! You are logged in as a <strong>{user.role}</strong>.
            </p>
            <p className="text-gray-400 text-sm">
              {user.isDemo ? 'This is a demo account. Explore the features available for your role.' : 'Access your specialized tools and features below.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;