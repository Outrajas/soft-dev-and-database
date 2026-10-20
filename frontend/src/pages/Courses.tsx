import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModularButton from '@/components/ui/modular-button';
import { BookOpen, Clock, Users, FileText, Video, Download, ExternalLink } from 'lucide-react';
import { useAuth } from "@/hooks/UseAuth";

const Courses: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const mockCourses = [
    {
      id: 'CS101',
      name: 'Introduction to Computer Science',
      instructor: 'Dr. Sarah Johnson',
      progress: 75,
      grade: 'A',
      credits: 4,
      schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
      room: 'Building A, Room 201',
      enrolled: 45,
      capacity: 50,
      status: 'active',
      nextClass: '2025-10-02 10:00 AM',
      assignments: 12,
      completedAssignments: 9,
      materials: [
        { name: 'Lecture 1 - Introduction', type: 'PDF', size: '2.4 MB' },
        { name: 'Week 1 Lab Guide', type: 'PDF', size: '1.8 MB' },
        { name: 'Recorded Lecture - Variables', type: 'Video', size: '156 MB' },
      ],
      upcomingEvents: [
        { title: 'Midterm Exam', date: '2025-10-15', type: 'exam' },
        { title: 'Project Submission', date: '2025-10-20', type: 'assignment' },
      ]
    },
    {
      id: 'MATH201',
      name: 'Calculus II',
      instructor: 'Prof. Michael Chen',
      progress: 62,
      grade: 'B+',
      credits: 3,
      schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
      room: 'Building B, Room 305',
      enrolled: 38,
      capacity: 40,
      status: 'active',
      nextClass: '2025-10-03 2:00 PM',
      assignments: 10,
      completedAssignments: 6,
      materials: [
        { name: 'Chapter 5 Notes', type: 'PDF', size: '3.2 MB' },
        { name: 'Problem Set 4', type: 'PDF', size: '890 KB' },
      ],
      upcomingEvents: [
        { title: 'Quiz 3', date: '2025-10-08', type: 'quiz' },
        { title: 'Homework 5 Due', date: '2025-10-12', type: 'assignment' },
      ]
    },
    {
      id: 'ENG105',
      name: 'Academic Writing',
      instructor: 'Dr. Emily Rodriguez',
      progress: 88,
      grade: 'A-',
      credits: 3,
      schedule: 'Mon, Wed 3:00 PM - 4:30 PM',
      room: 'Building C, Room 102',
      enrolled: 25,
      capacity: 30,
      status: 'active',
      nextClass: '2025-10-02 3:00 PM',
      assignments: 8,
      completedAssignments: 7,
      materials: [
        { name: 'Essay Guidelines', type: 'PDF', size: '1.2 MB' },
        { name: 'Sample Essays', type: 'PDF', size: '4.5 MB' },
      ],
      upcomingEvents: [
        { title: 'Final Essay Draft', date: '2025-10-18', type: 'assignment' },
      ]
    },
    {
      id: 'PHY102',
      name: 'Physics I - Mechanics',
      instructor: 'Dr. Robert Kumar',
      progress: 54,
      grade: 'B',
      credits: 4,
      schedule: 'Tue, Thu 10:00 AM - 11:30 AM',
      room: 'Building D, Lab 401',
      enrolled: 42,
      capacity: 45,
      status: 'active',
      nextClass: '2025-10-03 10:00 AM',
      assignments: 11,
      completedAssignments: 5,
      materials: [
        { name: 'Lab Manual', type: 'PDF', size: '5.6 MB' },
        { name: 'Newton\'s Laws Review', type: 'PDF', size: '2.1 MB' },
        { name: 'Lab 3 Demo Video', type: 'Video', size: '203 MB' },
      ],
      upcomingEvents: [
        { title: 'Lab Practical', date: '2025-10-10', type: 'exam' },
        { title: 'Problem Set 6', date: '2025-10-14', type: 'assignment' },
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'dropped': return 'error';
      default: return 'default';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'text-academic-error';
      case 'quiz': return 'text-academic-warning';
      case 'assignment': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          My Courses
        </h1>
        <p className="text-muted-foreground">
          Manage your enrolled courses, access materials, and track progress
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="academic-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/15 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{mockCourses.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-academic-success/15 rounded-xl">
                <FileText className="h-6 w-6 text-academic-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-academic-success">
                  {mockCourses.reduce((acc, c) => acc + c.completedAssignments, 0)}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed Work</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-academic-warning/15 rounded-xl">
                <Clock className="h-6 w-6 text-academic-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold text-academic-warning">
                  {mockCourses.reduce((acc, c) => acc + (c.assignments - c.completedAssignments), 0)}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/15 rounded-xl">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">
                  {mockCourses.reduce((acc, c) => acc + c.credits, 0)}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockCourses.map((course) => (
          <Card key={course.id} className="academic-card group hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <span>{course.name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <span>{course.instructor}</span>
                    <span>•</span>
                    <Badge variant="outline" color={getStatusColor(course.status)}>
                      {course.id}
                    </Badge>
                  </CardDescription>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {course.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-medium text-primary">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Schedule</p>
                  <p className="font-medium">{course.schedule.split(' ')[0]}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Assignments</p>
                  <p className="font-medium">{course.completedAssignments}/{course.assignments} completed</p>
                </div>
              </div>

              {/* Upcoming Events */}
              {course.upcomingEvents.length > 0 && (
                <div className="pt-3 border-t space-y-2">
                  <p className="text-sm font-medium">Upcoming</p>
                  {course.upcomingEvents.slice(0, 2).map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className={getEventTypeColor(event.type)}>{event.title}</span>
                      <span className="text-muted-foreground">{event.date}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <ModularButton 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Details
                </ModularButton>
                <ModularButton variant="outline" size="sm" glow>
                  <FileText className="h-4 w-4" />
                </ModularButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Details Modal (simplified) */}
      {selectedCourse && (
        <Card className="academic-card fixed inset-4 z-50 overflow-auto">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>
                {mockCourses.find(c => c.id === selectedCourse)?.name}
              </CardTitle>
              <ModularButton 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedCourse(null)}
              >
                Close
              </ModularButton>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="materials" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="info">Course Info</TabsTrigger>
              </TabsList>
              <TabsContent value="materials" className="space-y-3 mt-4">
                {mockCourses.find(c => c.id === selectedCourse)?.materials.map((material, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {material.type === 'Video' ? <Video className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground">{material.size}</p>
                      </div>
                    </div>
                    <ModularButton variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </ModularButton>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="schedule" className="mt-4">
                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">Class Schedule</p>
                    <p className="text-sm text-muted-foreground">{mockCourses.find(c => c.id === selectedCourse)?.schedule}</p>
                    <p className="text-sm text-muted-foreground mt-1">{mockCourses.find(c => c.id === selectedCourse)?.room}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-medium">{mockCourses.find(c => c.id === selectedCourse)?.instructor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="font-medium">{mockCourses.find(c => c.id === selectedCourse)?.credits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enrollment</p>
                    <p className="font-medium">{mockCourses.find(c => c.id === selectedCourse)?.enrolled}/{mockCourses.find(c => c.id === selectedCourse)?.capacity} students</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Courses;
