import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  CreditCard,
  Bell,
  FileText,
  Award
} from 'lucide-react';
import { User } from '@/types/Auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ParentDashboardProps {
  user: User;
}

interface Child {
  student_id: number;
  name: string;
  grade_level: string;
  program: string;
  status: string;
}

interface ChildProgress {
  student_id: number;
  student_name: string;
  overall_gpa: number;
  attendance: number;
  completed_courses: number;
  total_courses: number;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user }) => {
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [childProgress, setChildProgress] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching dashboard data for user:', user);

        // Fetch children data
        const childrenData = await api.getParentChildren(user.userId);
        setChildren(Array.isArray(childrenData) ? childrenData : []);

        // Fetch children progress data
        const progressData = await api.getParentChildrenProgress(user.userId);
        setChildProgress(Array.isArray(progressData) ? progressData : []);

      } catch (error) {
        console.error('Error fetching parent data:', error);
        toast({
          title: "Error",
          description: "Failed to load parent dashboard data",
          variant: "destructive"
        });
        
        // Set fallback demo data
        setChildren(getDemoChildren());
        setChildProgress(getDemoChildProgress());
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, [user, toast]);

  // Demo data fallbacks
  const getDemoChildren = (): Child[] => [
    {
      student_id: 1001,
      name: 'Alex Johnson',
      grade_level: 'Sophomore',
      program: 'BSc Computer Science',
      status: 'active'
    },
    {
      student_id: 1002, 
      name: 'Sarah Johnson',
      grade_level: 'Freshman',
      program: 'BSc Biology',
      status: 'active'
    }
  ];

  const getDemoChildProgress = (): ChildProgress[] => [
    {
      student_id: 1001,
      student_name: 'Alex Johnson',
      overall_gpa: 3.75,
      attendance: 94,
      completed_courses: 12,
      total_courses: 16
    },
    {
      student_id: 1002,
      student_name: 'Sarah Johnson', 
      overall_gpa: 3.92,
      attendance: 98,
      completed_courses: 4,
      total_courses: 8
    }
  ];

  const getGpaColor = (gpa: number): string => {
    if (gpa >= 3.7) return 'text-green-400';
    if (gpa >= 3.3) return 'text-blue-400';
    if (gpa >= 2.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAttendanceColor = (attendance: number): string => {
    if (attendance >= 90) return 'text-green-400';
    if (attendance >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Safe calculation for average GPA
  const calculateAverageGPA = (): string => {
    if (!childProgress || childProgress.length === 0) return '0.00';
    
    const totalGPA = childProgress.reduce((sum, child) => {
      return sum + (child.overall_gpa || 0);
    }, 0);
    
    return (totalGPA / childProgress.length).toFixed(2);
  };

  // Safe calculation for total completed courses
  const calculateTotalCompletedCourses = (): number => {
    if (!childProgress || childProgress.length === 0) return 0;
    
    return childProgress.reduce((sum, child) => {
      return sum + (child.completed_courses || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Parent Dashboard</h1>
        <p className="text-gray-400">
          Welcome back! Monitor your children's academic progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{children.length}</p>
                <p className="text-sm text-gray-400">Children</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {calculateAverageGPA()}
                </p>
                <p className="text-sm text-gray-400">Average GPA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {calculateTotalCompletedCourses()}
                </p>
                <p className="text-sm text-gray-400">Courses Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Progress */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span>Children's Academic Progress</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Overview of your children's academic performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">Student</TableHead>
                <TableHead className="text-white">Program</TableHead>
                <TableHead className="text-white">GPA</TableHead>
                <TableHead className="text-white">Attendance</TableHead>
                <TableHead className="text-white">Progress</TableHead>
                <TableHead className="text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childProgress && childProgress.length > 0 ? (
                childProgress.map((child) => (
                  <TableRow key={child.student_id} className="border-gray-700">
                    <TableCell className="font-medium text-white">
                      {child.student_name || 'Unknown Student'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {children.find(c => c.student_id === child.student_id)?.program || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${getGpaColor(child.overall_gpa || 0)}`}>
                        {(child.overall_gpa || 0).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${getAttendanceColor(child.attendance || 0)}`}>
                        {child.attendance || 0}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={((child.completed_courses || 0) / (child.total_courses || 1)) * 100} 
                          className="w-20" 
                        />
                        <span className="text-sm text-gray-300">
                          {child.completed_courses || 0}/{child.total_courses || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-400 border-0">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No children data available</p>
                    <p className="text-sm mt-2">Using demo data for display</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/30 transition-colors">
          <CardContent className="p-6">
            <Button 
              className="w-full h-20 flex flex-col bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.href = '/children'}
            >
              <Users className="h-6 w-6 mb-2" />
              <span>View Children</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:border-green-500/30 transition-colors">
          <CardContent className="p-6">
            <Button 
              className="w-full h-20 flex flex-col bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.href = '/progress'}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Academic Progress</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:border-orange-500/30 transition-colors">
          <CardContent className="p-6">
            <Button 
              className="w-full h-20 flex flex-col bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => window.location.href = '/fee-payments'}
            >
              <CreditCard className="h-6 w-6 mb-2" />
              <span>Fee Payments</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/30 transition-colors">
          <CardContent className="p-6">
            <Button 
              className="w-full h-20 flex flex-col bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => window.location.href = '/notifications'}
            >
              <Bell className="h-6 w-6 mb-2" />
              <span>Notifications</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            <span>Recent Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-white font-medium">Progress Report Available</p>
              <p className="text-blue-400 text-sm">Alex's mid-term progress report is now available for review</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-white font-medium">Fee Payment Reminder</p>
              <p className="text-green-400 text-sm">Spring semester fees are due in 14 days</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-white font-medium">Parent-Teacher Meeting</p>
              <p className="text-yellow-400 text-sm">Schedule parent-teacher meetings for next month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDashboard;