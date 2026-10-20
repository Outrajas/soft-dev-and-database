import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Users,
  Clock,
  Building,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ModularButton from '@/components/ui/modular-button';

interface Course {
  COURSE_ID: number;
  CODE: string;
  TITLE: string;
  DESCRIPTION: string;
  CREDITS: number;
  DEPARTMENT: string;
  INSTRUCTOR: string;
  ENROLLED: number;
  CAPACITY: number;
  STATUS: string;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const { toast } = useToast();

  // Mock data for demo
  const mockCourses: Course[] = [
    {
      COURSE_ID: 1,
      CODE: 'CS101',
      TITLE: 'Introduction to Computer Science',
      DESCRIPTION: 'Fundamental concepts of computer science and programming',
      CREDITS: 4,
      DEPARTMENT: 'Computer Science',
      INSTRUCTOR: 'Dr. Sarah Johnson',
      ENROLLED: 45,
      CAPACITY: 50,
      STATUS: 'active'
    },
    {
      COURSE_ID: 2,
      CODE: 'MATH201',
      TITLE: 'Linear Algebra',
      DESCRIPTION: 'Vector spaces, linear transformations, and matrices',
      CREDITS: 3,
      DEPARTMENT: 'Mathematics',
      INSTRUCTOR: 'Prof. Michael Chen',
      ENROLLED: 38,
      CAPACITY: 40,
      STATUS: 'active'
    },
    {
      COURSE_ID: 3,
      CODE: 'PHY301',
      TITLE: 'Quantum Mechanics',
      DESCRIPTION: 'Advanced quantum theory and applications',
      CREDITS: 4,
      DEPARTMENT: 'Physics',
      INSTRUCTOR: 'Dr. Robert Kumar',
      ENROLLED: 22,
      CAPACITY: 25,
      STATUS: 'active'
    },
    {
      COURSE_ID: 4,
      CODE: 'BIO202',
      TITLE: 'Genetics and Evolution',
      DESCRIPTION: 'Principles of genetic inheritance and evolutionary biology',
      CREDITS: 3,
      DEPARTMENT: 'Biology',
      INSTRUCTOR: 'Dr. Emily Rodriguez',
      ENROLLED: 35,
      CAPACITY: 40,
      STATUS: 'active'
    }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        // In real app, this would be an API call
        setCourses(mockCourses);
        setFilteredCourses(mockCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses(mockCourses);
        setFilteredCourses(mockCourses);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.CODE.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.TITLE.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.DEPARTMENT.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.INSTRUCTOR.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(course => course.DEPARTMENT === departmentFilter);
    }
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, departmentFilter]);

  const handleEditCourse = (course: Course) => {
    toast({
      title: "Edit Course",
      description: `Editing course: ${course.CODE} - ${course.TITLE}`,
    });
  };

  const handleDeleteCourse = (course: Course) => {
    toast({
      title: "Delete Course",
      description: `Are you sure you want to delete ${course.CODE}?`,
      variant: "destructive"
    });
  };

  const handleCreateCourse = () => {
    toast({
      title: "Create New Course",
      description: "Opening course creation form...",
    });
  };

  const getEnrollmentColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getDepartments = () => {
    return [...new Set(courses.map(course => course.DEPARTMENT))];
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <span>Course Management</span>
          </h1>
          <p className="text-gray-400">
            Manage all courses, offerings, and enrollments
          </p>
        </div>
        <ModularButton 
          onClick={handleCreateCourse}
          glow
          icon={Plus}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add New Course
        </ModularButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{courses.length}</div>
            <p className="text-xs text-gray-400">Total Courses</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {courses.reduce((sum, course) => sum + course.ENROLLED, 0)}
            </div>
            <p className="text-xs text-gray-400">Total Enrollments</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {getDepartments().length}
            </div>
            <p className="text-xs text-gray-400">Departments</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {new Set(courses.map(c => c.INSTRUCTOR)).size}
            </div>
            <p className="text-xs text-gray-400">Instructors</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses by code, title, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Course Catalog</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredCourses.length} courses found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-700">
                <TableHead className="text-white">Course</TableHead>
                <TableHead className="text-white">Details</TableHead>
                <TableHead className="text-white">Department</TableHead>
                <TableHead className="text-white">Enrollment</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.COURSE_ID} className="border-gray-700 hover:bg-gray-700/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{course.CODE}</p>
                      <p className="text-lg font-bold text-white">{course.TITLE}</p>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {course.DESCRIPTION}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{course.INSTRUCTOR}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">{course.CREDITS} Credits</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{course.DEPARTMENT}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Enrolled</span>
                        <span className="text-white">
                          {course.ENROLLED}/{course.CAPACITY}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getEnrollmentColor(course.ENROLLED, course.CAPACITY)}`}
                          style={{ width: `${(course.ENROLLED / course.CAPACITY) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 text-right">
                        {Math.round((course.ENROLLED / course.CAPACITY) * 100)}% full
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      course.STATUS === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }>
                      {course.STATUS}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <ModularButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCourse(course)}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                        icon={Edit}
                      >
                        Edit
                      </ModularButton>
                      <ModularButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCourse(course)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        icon={Trash2}
                      >
                        Delete
                      </ModularButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Courses Found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;