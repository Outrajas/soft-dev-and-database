import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Users,
  FileText,
  Bell,
  BarChart3,
  Award
} from 'lucide-react';
import { User } from '@/types/Auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface StudentDashboardProps {
  user: User;
}

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  instructor: string;
  schedule: string;
  credits: number;
  progress?: number;
}

interface Grade {
  course_id: number;
  course_name: string;
  assignment: string;
  grade: string;
  max_grade: string;
  percentage: number;
  submitted_at: string;
}

interface Attendance {
  course_id: number;
  course_name: string;
  present: number;
  total: number;
  percentage: number;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [gpa, setGpa] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses - FIXED: Remove .courses access
        const coursesData = await api.getStudentCourses(user.userId);
        setCourses(Array.isArray(coursesData) ? coursesData : []);

        // Fetch grades - FIXED: Remove .grades access
        const gradesData = await api.getStudentGrades(user.userId);
        setGrades(Array.isArray(gradesData) ? gradesData : []);

        // Fetch attendance - FIXED: Remove .attendance access
        const attendanceData = await api.getStudentAttendance(user.userId);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);

        // Calculate GPA - FIXED: Remove .data access
        const gpaData = await api.calculateGPA(user.userId);
        const calculatedGpa = typeof gpaData === 'object' && 'gpa' in gpaData ? gpaData.gpa : 3.75;
        setGpa(calculatedGpa);

      } catch (error) {
        console.error('Error fetching student data:', error);
        toast({
          title: "Error",
          description: "Failed to load student data",
          variant: "destructive"
        });
        
        // Set fallback demo data
        setCourses(getDemoCourses());
        setGrades(getDemoGrades());
        setAttendance(getDemoAttendance());
        setGpa(3.75);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user.userId, toast]);

  // Demo data fallbacks
  const getDemoCourses = (): Course[] => [
    {
      course_id: 1,
      course_code: 'CS101',
      course_name: 'Introduction to Computer Science',
      instructor: 'Dr. Sarah Chen',
      schedule: 'Mon, Wed 10:00-11:30 AM',
      credits: 3,
      progress: 75
    },
    {
      course_id: 2,
      course_code: 'MATH201',
      course_name: 'Calculus II',
      instructor: 'Prof. Michael Brown',
      schedule: 'Tue, Thu 1:00-2:30 PM',
      credits: 4,
      progress: 60
    },
    {
      course_id: 3,
      course_code: 'PHY101',
      course_name: 'Physics Fundamentals',
      instructor: 'Dr. Emily Wilson',
      schedule: 'Mon, Wed, Fri 9:00-10:00 AM',
      credits: 3,
      progress: 85
    }
  ];

  const getDemoGrades = (): Grade[] => [
    {
      course_id: 1,
      course_name: 'Introduction to Computer Science',
      assignment: 'Programming Assignment 1',
      grade: 'A',
      max_grade: 'A',
      percentage: 95,
      submitted_at: '2025-09-15'
    },
    {
      course_id: 2,
      course_name: 'Calculus II',
      assignment: 'Midterm Exam',
      grade: 'B+',
      max_grade: 'A',
      percentage: 88,
      submitted_at: '2025-09-20'
    }
  ];

  const getDemoAttendance = (): Attendance[] => [
    {
      course_id: 1,
      course_name: 'Introduction to Computer Science',
      present: 12,
      total: 15,
      percentage: 80
    },
    {
      course_id: 2,
      course_name: 'Calculus II',
      present: 14,
      total: 15,
      percentage: 93
    }
  ];

  const getGradeColor = (grade: string): string => {
    switch (grade.toUpperCase()) {
      case 'A': return 'text-green-400';
      case 'B+': return 'text-blue-400';
      case 'B': return 'text-blue-300';
      case 'C+': return 'text-yellow-400';
      case 'C': return 'text-yellow-300';
      case 'D': return 'text-orange-400';
      case 'F': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAttendanceColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-yellow-400';
    if (percentage >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const quickActions = [
    { icon: BookOpen, label: 'My Courses', description: 'View your enrolled courses', href: '/courses', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: GraduationCap, label: 'My Grades', description: 'Check your academic progress', href: '/grades', color: 'bg-green-600 hover:bg-green-700' },
    { icon: Calendar, label: 'Attendance', description: 'View attendance records', href: '/attendance', color: 'bg-purple-600 hover:bg-purple-700' },
    { icon: CreditCard, label: 'Payments', description: 'Manage tuition and fees', href: '/payments', color: 'bg-orange-600 hover:bg-orange-700' }
  ];

  const upcomingDeadlines = [
    { course: 'CS101', assignment: 'Final Project', due: 'in 3 days', priority: 'high' },
    { course: 'MATH201', assignment: 'Homework 6', due: 'in 1 day', priority: 'high' },
    { course: 'PHY301', assignment: 'Research Paper', due: 'in 5 days', priority: 'medium' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-400">
          Student ID: {user.studentId} • {user.programName} • {user.department}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{gpa.toFixed(2)}</div>
            <p className="text-xs text-gray-400">Current Semester</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {attendance.length > 0 
                ? Math.round(attendance.reduce((acc, curr) => acc + curr.percentage, 0) / attendance.length) 
                : 94
              }%
            </div>
            <Progress 
              value={attendance.length > 0 
                ? Math.round(attendance.reduce((acc, curr) => acc + curr.percentage, 0) / attendance.length) 
                : 94
              } 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{courses.length}</div>
            <p className="text-xs text-gray-400">Active Enrollments</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{grades.length}</div>
            <p className="text-xs text-gray-400">Graded</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Courses */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <span>Current Courses</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your enrolled courses for this semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.course_id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{course.course_code}</h4>
                    <p className="text-sm text-gray-300">{course.course_name}</p>
                    <p className="text-xs text-gray-400">{course.instructor}</p>
                    <p className="text-xs text-gray-400 mt-1">{course.schedule}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Progress value={course.progress || 0} className="w-20" />
                      <span className="text-sm text-gray-300">{course.progress}%</span>
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {course.credits} Credits
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-400" />
              <span>Recent Grades</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest assignment and exam results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-white">Course</TableHead>
                  <TableHead className="text-white">Assignment</TableHead>
                  <TableHead className="text-white">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.slice(0, 5).map((grade, index) => (
                  <TableRow key={index} className="border-gray-700">
                    <TableCell className="font-medium text-white">
                      {grade.course_name}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {grade.assignment}
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {grades.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No grades available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Frequently used features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button 
                    key={index}
                    className={`h-20 flex flex-col ${action.color} text-white`}
                    onClick={() => window.location.href = action.href}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-400" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your upcoming assignments and exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">{deadline.course}</p>
                    <p className="text-sm text-gray-400">{deadline.assignment}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(deadline.priority)}>
                      {deadline.due}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-gray-600 text-white hover:bg-gray-700">
              View Full Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="h-5 w-5 text-yellow-400" />
            <span>Attendance Overview</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your class attendance for this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">Course</TableHead>
                <TableHead className="text-white">Present</TableHead>
                <TableHead className="text-white">Total</TableHead>
                <TableHead className="text-white">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((record, index) => (
                <TableRow key={index} className="border-gray-700">
                  <TableCell className="font-medium text-white">
                    {record.course_name}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {record.present}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {record.total}
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${getAttendanceColor(record.percentage)}`}>
                      {record.percentage}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {attendance.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No attendance records available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications Alert */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            <span>Recent Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-white font-medium">New Grade Posted</p>
              <p className="text-yellow-400 text-sm">CS101 - Midterm grade is now available</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-white font-medium">Course Announcement</p>
              <p className="text-blue-400 text-sm">MATH201 - Office hours changed to Friday 2-4 PM</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="text-white font-medium">Payment Reminder</p>
              <p className="text-red-400 text-sm">Tuition fee due in 7 days - $1,250.00</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 border-gray-600 text-white hover:bg-gray-700">
            View All Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;