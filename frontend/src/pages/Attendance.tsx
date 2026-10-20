import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import StatCard from '@/components/ui/stat-card';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const Attendance: React.FC = () => {
  const mockAttendance = [
    {
      courseId: 'CS101',
      courseName: 'Introduction to Computer Science',
      instructor: 'Dr. Sarah Johnson',
      totalClasses: 28,
      attended: 26,
      absent: 2,
      late: 0,
      percentage: 92.86,
      records: [
        { date: '2025-09-30', status: 'present', time: '10:05 AM' },
        { date: '2025-09-27', status: 'present', time: '10:02 AM' },
        { date: '2025-09-25', status: 'absent', reason: 'Medical' },
        { date: '2025-09-23', status: 'present', time: '10:00 AM' },
        { date: '2025-09-20', status: 'present', time: '10:08 AM' },
      ]
    },
    {
      courseId: 'MATH201',
      courseName: 'Calculus II',
      instructor: 'Prof. Michael Chen',
      totalClasses: 24,
      attended: 23,
      absent: 0,
      late: 1,
      percentage: 95.83,
      records: [
        { date: '2025-09-29', status: 'present', time: '2:00 PM' },
        { date: '2025-09-26', status: 'present', time: '2:05 PM' },
        { date: '2025-09-24', status: 'late', time: '2:25 PM' },
        { date: '2025-09-22', status: 'present', time: '2:01 PM' },
        { date: '2025-09-19', status: 'present', time: '2:03 PM' },
      ]
    },
    {
      courseId: 'ENG105',
      courseName: 'Academic Writing',
      instructor: 'Dr. Emily Rodriguez',
      totalClasses: 22,
      attended: 22,
      absent: 0,
      late: 0,
      percentage: 100,
      records: [
        { date: '2025-09-30', status: 'present', time: '3:00 PM' },
        { date: '2025-09-27', status: 'present', time: '3:02 PM' },
        { date: '2025-09-25', status: 'present', time: '3:01 PM' },
        { date: '2025-09-23', status: 'present', time: '3:00 PM' },
        { date: '2025-09-20', status: 'present', time: '3:05 PM' },
      ]
    },
    {
      courseId: 'PHY102',
      courseName: 'Physics I - Mechanics',
      instructor: 'Dr. Robert Kumar',
      totalClasses: 26,
      attended: 23,
      absent: 1,
      late: 2,
      percentage: 88.46,
      records: [
        { date: '2025-09-29', status: 'present', time: '10:00 AM' },
        { date: '2025-09-26', status: 'late', time: '10:22 AM' },
        { date: '2025-09-24', status: 'present', time: '10:05 AM' },
        { date: '2025-09-22', status: 'absent', reason: 'Family emergency' },
        { date: '2025-09-19', status: 'late', time: '10:18 AM' },
      ]
    }
  ];

  const totalPresent = mockAttendance.reduce((sum, c) => sum + c.attended, 0);
  const totalAbsent = mockAttendance.reduce((sum, c) => sum + c.absent, 0);
  const totalLate = mockAttendance.reduce((sum, c) => sum + c.late, 0);
  const totalClasses = mockAttendance.reduce((sum, c) => sum + c.totalClasses, 0);
  const overallPercentage = ((totalPresent / totalClasses) * 100).toFixed(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return CheckCircle;
      case 'absent': return XCircle;
      case 'late': return Clock;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          My Attendance
        </h1>
        <p className="text-muted-foreground">
          Track your class attendance and maintain good academic standing
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          icon={Calendar}
          color="primary"
          glow
          trend={{ value: 2.3, label: 'vs last month' }}
        />
        <StatCard
          title="Classes Attended"
          value={totalPresent}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Absent"
          value={totalAbsent}
          icon={XCircle}
          color="error"
        />
        <StatCard
          title="Late Arrivals"
          value={totalLate}
          icon={Clock}
          color="warning"
        />
      </div>

      {/* Attendance Warning */}
      {parseFloat(overallPercentage) < 90 && (
        <Card className="academic-card border-academic-warning/50 bg-academic-warning/5">
          <CardContent className="flex items-center space-x-3 p-4">
            <AlertTriangle className="h-5 w-5 text-academic-warning flex-shrink-0" />
            <div>
              <p className="font-medium text-academic-warning">Attendance Warning</p>
              <p className="text-sm text-muted-foreground">
                Your attendance is below 90%. Maintain at least 75% to remain eligible for exams.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Attendance */}
      <div className="space-y-4">
        {mockAttendance.map((course) => (
          <Card key={course.courseId} className="academic-card group hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-xl">{course.courseName}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <span>{course.instructor}</span>
                    <span>•</span>
                    <span>{course.courseId}</span>
                  </CardDescription>
                </div>
                <Badge 
                  className="text-lg px-4 py-1"
                  color={course.percentage >= 90 ? 'success' : course.percentage >= 75 ? 'warning' : 'error'}
                >
                  {course.percentage.toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-medium">
                    {course.attended}/{course.totalClasses} classes
                  </span>
                </div>
                <Progress value={course.percentage} className="h-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-academic-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-academic-success">{course.attended}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Present</p>
                </div>
                <div className="p-3 bg-academic-error/10 rounded-lg">
                  <p className="text-2xl font-bold text-academic-error">{course.absent}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Absent</p>
                </div>
                <div className="p-3 bg-academic-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-academic-warning">{course.late}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Late</p>
                </div>
              </div>

              {/* Recent Records */}
              <div className="pt-3 border-t space-y-2">
                <p className="text-sm font-medium">Recent Records</p>
                <div className="space-y-2">
                  {course.records.map((record, idx) => {
                    const StatusIcon = getStatusIcon(record.status);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`h-4 w-4 ${
                            record.status === 'present' ? 'text-academic-success' :
                            record.status === 'absent' ? 'text-academic-error' :
                            'text-academic-warning'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{record.date}</p>
                            {record.reason && (
                              <p className="text-xs text-muted-foreground">{record.reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" color={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                          {record.time && (
                            <p className="text-xs text-muted-foreground mt-1">{record.time}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Attendance;
