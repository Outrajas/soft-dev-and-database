import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  BarChart3,
  TrendingUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  UserPlus
} from 'lucide-react';
import { api } from '@/lib/api';

// Define proper TypeScript interfaces
interface User {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface SystemStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalRevenue: number;
  systemHealth: number;
  pendingApprovals: number;
}

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

interface PendingRequest {
  id: number;
  type: string;
  user: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalRevenue: 0,
    systemHealth: 95,
    pendingApprovals: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demo
  const getMockStats = useCallback((): SystemStats => ({
    totalStudents: 1247,
    totalFaculty: 89,
    totalCourses: 156,
    totalRevenue: 2450000,
    systemHealth: 95,
    pendingApprovals: 12
  }), []);

  const getMockActivity = useCallback((): RecentActivity[] => [
    { id: 1, action: 'New student registration', user: 'Alex Johnson', timestamp: '2024-03-15 10:30', status: 'success' },
    { id: 2, action: 'Course creation', user: 'Dr. Sarah Chen', timestamp: '2024-03-15 09:15', status: 'success' },
    { id: 3, action: 'System backup', user: 'System', timestamp: '2024-03-15 06:00', status: 'success' },
    { id: 4, action: 'Payment failed', user: 'Michael Rodriguez', timestamp: '2024-03-14 16:45', status: 'warning' },
    { id: 5, action: 'Faculty account creation', user: 'Prof. Emily Watson', timestamp: '2024-03-14 14:20', status: 'success' },
  ], []);

  const getMockRequests = useCallback((): PendingRequest[] => [
    { id: 1, type: 'Faculty Approval', user: 'Dr. James Wilson', date: '2024-03-15', priority: 'high' },
    { id: 2, type: 'Course Modification', user: 'CS Department', date: '2024-03-14', priority: 'medium' },
    { id: 3, type: 'Student Appeal', user: 'Sarah Johnson', date: '2024-03-14', priority: 'high' },
    { id: 4, type: 'System Access', user: 'Finance Team', date: '2024-03-13', priority: 'low' },
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching admin dashboard data for user:", user);
        
        const [studentsData, coursesData] = await Promise.all([
          api.getStudents().catch(() => []),
          api.getCourses().catch(() => [])
        ]);
        
        console.log("📊 Admin data fetched:", {
          students: studentsData?.length,
          courses: coursesData?.length
        });

        // Calculate stats from real data
        const totalStudents = studentsData?.length || 1247;
        const totalCourses = coursesData?.length || 156;
        const totalFaculty = Math.floor(totalStudents / 14); // Estimate faculty count
        
        setSystemStats({
          totalStudents,
          totalFaculty,
          totalCourses,
          totalRevenue: totalStudents * 1965, // Estimate revenue
          systemHealth: 95,
          pendingApprovals: 12
        });

        setRecentActivity(getMockActivity());
        setPendingRequests(getMockRequests());
      } catch (error) {
        console.error('❌ Error fetching admin data:', error);
        setSystemStats(getMockStats());
        setRecentActivity(getMockActivity());
        setPendingRequests(getMockRequests());
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getMockStats, getMockActivity, getMockRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-400">
          System overview and administrative controls
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{systemStats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Faculty</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{systemStats.totalFaculty}</div>
            <p className="text-xs text-gray-400">Teaching staff</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{systemStats.totalCourses}</div>
            <p className="text-xs text-gray-400">Active courses</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{formatCurrency(systemStats.totalRevenue)}</div>
            <p className="text-xs text-gray-400">This academic year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Current system performance and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Overall System Health</span>
                <span className="text-green-400">{systemStats.systemHealth}%</span>
              </div>
              <Progress value={systemStats.systemHealth} className="h-2 bg-gray-600" />
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Database Performance</span>
                <span className="text-green-400">98%</span>
              </div>
              <Progress value={98} className="h-2 bg-gray-600" />
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">API Response Time</span>
                <span className="text-yellow-400">85%</span>
              </div>
              <Progress value={85} className="h-2 bg-gray-600" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-xl font-bold text-blue-400">24/7</div>
                <p className="text-xs text-gray-400">Uptime</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-xl font-bold text-green-400">99.9%</div>
                <p className="text-xs text-gray-400">Reliability</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-orange-400" />
              <span>Pending Approvals ({systemStats.pendingApprovals})</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Requests requiring administrative action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{request.type}</p>
                  <p className="text-xs text-gray-400">{request.user}</p>
                  <p className="text-xs text-gray-400">{request.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Review
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
              View All Requests
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Latest system activities and events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-400">By {activity.user}</p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-400" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 h-16 flex-col">
                <UserPlus className="h-5 w-5 mb-1" />
                <span className="text-sm">Add User</span>
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 h-16 flex-col">
                <BookOpen className="h-5 w-5 mb-1" />
                <span className="text-sm">Manage Courses</span>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 h-16 flex-col">
                <BarChart3 className="h-5 w-5 mb-1" />
                <span className="text-sm">View Reports</span>
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700 h-16 flex-col">
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-sm">System Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;