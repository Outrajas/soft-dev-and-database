import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import StatCard from '@/components/ui/stat-card';
import ModularButton from '@/components/ui/modular-button';
import { Users, BookOpen, FileText, Calendar, Clock, TrendingUp } from 'lucide-react';

const MyClasses: React.FC = () => {
  const mockClasses = [
    {
      id: 'CS101-A',
      course: 'Introduction to Computer Science',
      section: 'Section A',
      schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
      room: 'Building A, Room 201',
      enrolled: 45,
      capacity: 50,
      avgGrade: 'B+',
      avgAttendance: 92,
      pendingAssignments: 12,
      upcomingClasses: 3,
      recentActivity: [
        { type: 'assignment', title: 'Homework 5 submitted by 23 students', time: '2 hours ago' },
        { type: 'grade', title: 'Midterm grades posted', time: '1 day ago' },
      ]
    },
    {
      id: 'CS101-B',
      course: 'Introduction to Computer Science',
      section: 'Section B',
      schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
      room: 'Building A, Room 203',
      enrolled: 42,
      capacity: 50,
      avgGrade: 'B',
      avgAttendance: 88,
      pendingAssignments: 15,
      upcomingClasses: 2,
      recentActivity: [
        { type: 'announcement', title: 'Posted lecture notes for Chapter 5', time: '5 hours ago' },
        { type: 'assignment', title: 'New assignment created', time: '2 days ago' },
      ]
    },
    {
      id: 'CS301',
      course: 'Data Structures & Algorithms',
      section: 'Section A',
      schedule: 'Mon, Wed 3:00 PM - 4:30 PM',
      room: 'Building B, Lab 305',
      enrolled: 38,
      capacity: 40,
      avgGrade: 'A-',
      avgAttendance: 95,
      pendingAssignments: 8,
      upcomingClasses: 3,
      recentActivity: [
        { type: 'quiz', title: 'Quiz 3 completed by all students', time: '3 hours ago' },
        { type: 'grade', title: 'Project 2 grades released', time: '1 day ago' },
      ]
    }
  ];

  const totalStudents = mockClasses.reduce((sum, c) => sum + c.enrolled, 0);
  const totalPending = mockClasses.reduce((sum, c) => sum + c.pendingAssignments, 0);
  const avgAttendance = (mockClasses.reduce((sum, c) => sum + c.avgAttendance, 0) / mockClasses.length).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          My Classes
        </h1>
        <p className="text-muted-foreground">
          Manage your courses, students, and class activities
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Classes"
          value={mockClasses.length}
          icon={BookOpen}
          color="primary"
          glow
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="success"
        />
        <StatCard
          title="Pending Reviews"
          value={totalPending}
          icon={FileText}
          color="warning"
        />
        <StatCard
          title="Avg Attendance"
          value={`${avgAttendance}%`}
          icon={TrendingUp}
          color="primary"
        />
      </div>

      {/* Class Cards */}
      <div className="space-y-4">
        {mockClasses.map((classItem) => (
          <Card key={classItem.id} className="academic-card group hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-xl">{classItem.course}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <span>{classItem.section}</span>
                    <span>•</span>
                    <Badge variant="outline">{classItem.id}</Badge>
                  </CardDescription>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {classItem.avgGrade} Avg
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schedule Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{classItem.schedule}</p>
                    <p className="text-xs text-muted-foreground">{classItem.room}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Enrollment</p>
                    <p className="text-xs text-muted-foreground">
                      {classItem.enrolled}/{classItem.capacity} students
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-academic-success/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-academic-success">{classItem.avgAttendance}%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Attendance</p>
                </div>
                <div className="p-3 bg-academic-warning/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-academic-warning">{classItem.pendingAssignments}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">To Review</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{classItem.upcomingClasses}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Classes</p>
                </div>
              </div>

              {/* Enrollment Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Class Capacity</span>
                  <span className="font-medium">{classItem.enrolled}/{classItem.capacity}</span>
                </div>
                <Progress value={(classItem.enrolled / classItem.capacity) * 100} className="h-2" />
              </div>

              {/* Recent Activity */}
              <div className="pt-3 border-t space-y-2">
                <p className="text-sm font-medium">Recent Activity</p>
                <div className="space-y-2">
                  {classItem.recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <ModularButton variant="default" size="sm" glow className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </ModularButton>
                <ModularButton variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Gradebook
                </ModularButton>
                <ModularButton variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </ModularButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyClasses;
