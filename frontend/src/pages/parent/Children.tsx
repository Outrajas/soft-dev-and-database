import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatCard from '@/components/ui/stat-card';
import ModularButton from '@/components/ui/modular-button';
import { Users, BookOpen, TrendingUp, Calendar, FileText, Bell } from 'lucide-react';

const Children: React.FC = () => {
  const mockChildren = [
    {
      id: 'S2024001',
      name: 'Emma Johnson',
      grade: '10th Grade',
      section: 'A',
      gpa: 3.85,
      attendance: 96,
      courses: 6,
      nextClass: 'Mathematics - 10:00 AM',
      recentGrades: [
        { course: 'Mathematics', grade: 'A', percentage: 94 },
        { course: 'English', grade: 'A-', percentage: 91 },
        { course: 'Science', grade: 'A', percentage: 95 },
      ],
      upcomingEvents: [
        { title: 'Parent-Teacher Meeting', date: '2025-10-05', type: 'meeting' },
        { title: 'Math Midterm', date: '2025-10-12', type: 'exam' },
      ]
    },
    {
      id: 'S2026015',
      name: 'Noah Johnson',
      grade: '7th Grade',
      section: 'B',
      gpa: 3.65,
      attendance: 93,
      courses: 5,
      nextClass: 'Science - 11:30 AM',
      recentGrades: [
        { course: 'Science', grade: 'B+', percentage: 88 },
        { course: 'History', grade: 'A-', percentage: 90 },
        { course: 'English', grade: 'B', percentage: 85 },
      ],
      upcomingEvents: [
        { title: 'Science Fair', date: '2025-10-08', type: 'event' },
        { title: 'Field Trip Permission', date: '2025-10-15', type: 'action' },
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          My Children
        </h1>
        <p className="text-muted-foreground">
          Monitor your children's academic progress and activities
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Children Enrolled"
          value={mockChildren.length}
          icon={Users}
          color="primary"
          glow
        />
        <StatCard
          title="Average GPA"
          value={(mockChildren.reduce((sum, c) => sum + c.gpa, 0) / mockChildren.length).toFixed(2)}
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Total Courses"
          value={mockChildren.reduce((sum, c) => sum + c.courses, 0)}
          icon={BookOpen}
          color="warning"
        />
        <StatCard
          title="Upcoming Events"
          value={mockChildren.reduce((sum, c) => sum + c.upcomingEvents.length, 0)}
          icon={Calendar}
          color="primary"
        />
      </div>

      {/* Children Cards */}
      <div className="space-y-6">
        {mockChildren.map((child) => (
          <Card key={child.id} className="academic-card group hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${child.id}`} />
                    <AvatarFallback>{child.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{child.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{child.grade}</span>
                      <span>•</span>
                      <span>Section {child.section}</span>
                      <span>•</span>
                      <Badge variant="outline">{child.id}</Badge>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{child.gpa}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">GPA</p>
                </div>
                <div className="p-4 bg-academic-success/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-academic-success">{child.attendance}%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Attendance</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-accent">{child.courses}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Courses</p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Grades */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Recent Grades</span>
                  </h4>
                  <div className="space-y-2">
                    {child.recentGrades.map((grade, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{grade.course}</p>
                          <p className="text-xs text-muted-foreground">{grade.percentage}%</p>
                        </div>
                        <Badge color={grade.grade.startsWith('A') ? 'success' : 'primary'}>
                          {grade.grade}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Upcoming Events</span>
                  </h4>
                  <div className="space-y-2">
                    {child.upcomingEvents.map((event, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Class */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Next Class</p>
                <p className="font-medium">{child.nextClass}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <ModularButton variant="default" size="sm" glow className="flex-1">
                  View Full Report
                </ModularButton>
                <ModularButton variant="outline" size="sm">
                  Contact Teachers
                </ModularButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Children;
