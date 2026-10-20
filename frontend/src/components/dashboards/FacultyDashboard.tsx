import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  BookOpen, 
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  BarChart3
} from 'lucide-react';
import { User } from '@/types/Auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FacultyDashboardProps {
  user: User;
}

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  schedule: string;
  enrolled_students: number;
  status: string;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching faculty dashboard data for user:', user);
      
      // FIXED: Use proper faculty ID mapping without parseInt
      const facultyId = user.facultyId || 'F2023001'; // Default faculty ID for demo
      
      console.log(`🌐 Fetching courses for faculty ID: ${facultyId}`);
      // FIXED: Remove parseInt since facultyId is already a string
      const coursesResponse = await api.getFacultyCourses(facultyId);
      
      // FIXED: Handle different response formats
      let coursesData: Course[] = [];
      if (Array.isArray(coursesResponse)) {
        coursesData = coursesResponse;
      } else if (coursesResponse && coursesResponse.courses) {
        coursesData = coursesResponse.courses;
      } else {
        console.log('📋 Using demo courses as fallback');
        coursesData = getDemoCourses();
      }
      
      setCourses(coursesData);
      console.log(`✅ Loaded ${coursesData.length} courses for faculty`);

    } catch (error) {
      console.error('❌ Error fetching faculty data:', error);
      toast({
        title: "Info",
        description: "Using demo data for faculty dashboard",
        variant: "default"
      });
      setCourses(getDemoCourses());
    } finally {
      setLoading(false);
    }
  };

  fetchFacultyData();
}, [user, toast]);

  const getDemoCourses = (): Course[] => [
    {
      course_id: 1,
      course_code: 'CS101',
      course_name: 'Introduction to Computer Science',
      schedule: 'Mon, Wed 10:00-11:30 AM',
      enrolled_students: 45,
      status: 'active'
    },
    {
      course_id: 2,
      course_code: 'CS301',
      course_name: 'Data Structures and Algorithms',
      schedule: 'Tue, Thu 1:00-2:30 PM',
      enrolled_students: 32,
      status: 'active'
    },
    {
      course_id: 3,
      course_code: 'CS450',
      course_name: 'Advanced Database Systems',
      schedule: 'Mon, Wed, Fri 9:00-10:00 AM',
      enrolled_students: 28,
      status: 'active'
    }
  ];

  // FIXED: Use React Router navigation instead of window.location
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-white">Faculty Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, Professor {user.lastName}! Manage your courses and students.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{courses.length}</p>
                <p className="text-sm text-gray-400">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {courses.reduce((sum, course) => sum + course.enrolled_students, 0)}
                </p>
                <p className="text-sm text-gray-400">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-sm text-gray-400">Assignments Due</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">4.8/5.0</p>
                <p className="text-sm text-gray-400">Avg. Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <span>My Courses</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your currently assigned courses for this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">Course Code</TableHead>
                <TableHead className="text-white">Course Name</TableHead>
                <TableHead className="text-white">Schedule</TableHead>
                <TableHead className="text-white">Enrolled</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.course_id} className="border-gray-700">
                  <TableCell className="font-medium text-white">
                    {course.course_code}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {course.course_name}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {course.schedule}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {course.enrolled_students} students
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/20 text-green-400 border-0">
                      {course.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleNavigation('/classes')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Manage
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {courses.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - FIXED: Use React Router navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/30 transition-colors">
          <CardContent className="p-6">
            <Button 
              className="w-full h-20 flex flex-col bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleNavigation('/classes')}
            >
              <BookOpen className="h-6 w-6 mb-2" />
              <span>My Classes</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:border-green-500/30 transition-colors">
          <CardContent className="p-6">
            <Button 
              className="w-full h-20 flex flex-col bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleNavigation('/grade-management')}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Grade Management</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:border-orange-500/30 transition-colors">
          <CardContent className="p-6">
            <Button 
              className="w-full h-20 flex flex-col bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => handleNavigation('/attendance-tracking')}
            >
              <Users className="h-6 w-6 mb-2" />
              <span>Attendance</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/30 transition-colors">
          <CardContent className="p-6">
            <Button 
              className="w-full h-20 flex flex-col bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => handleNavigation('/schedule')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>Schedule</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;