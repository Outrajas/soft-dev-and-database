import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModularButton from '@/components/ui/modular-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Save, Download, UserCheck, UserX, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AttendanceTracking: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState('CS-301');
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});

  const classes = [
    {
      id: 'CS-301',
      name: 'Data Structures',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      students: [
        { id: 1, name: 'John Smith', totalClasses: 45, attended: 42, percentage: 93 },
        { id: 2, name: 'Emma Wilson', totalClasses: 45, attended: 44, percentage: 98 },
        { id: 3, name: 'Michael Brown', totalClasses: 45, attended: 38, percentage: 84 },
        { id: 4, name: 'Sarah Davis', totalClasses: 45, attended: 43, percentage: 96 },
        { id: 5, name: 'James Johnson', totalClasses: 45, attended: 45, percentage: 100 },
      ]
    },
    {
      id: 'CS-401',
      name: 'Advanced Algorithms',
      schedule: 'Tue, Thu - 2:00 PM',
      students: [
        { id: 6, name: 'Alice Cooper', totalClasses: 30, attended: 28, percentage: 93 },
        { id: 7, name: 'Bob Martinez', totalClasses: 30, attended: 25, percentage: 83 },
        { id: 8, name: 'Carol White', totalClasses: 30, attended: 30, percentage: 100 },
      ]
    }
  ];

  const currentClass = classes.find(c => c.id === selectedClass);

  const toggleAttendance = (studentId: number) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<number, boolean> = {};
    currentClass?.students.forEach(student => {
      newAttendance[student.id] = true;
    });
    setAttendance(newAttendance);
    toast({
      title: "Success",
      description: "All students marked as present",
    });
  };

  const saveAttendance = () => {
    toast({
      title: "Success",
      description: `Attendance saved for ${date.toLocaleDateString()}`,
    });
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-academic-success';
    if (percentage >= 75) return 'text-primary';
    if (percentage >= 60) return 'text-academic-warning';
    return 'text-destructive';
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'bg-academic-success text-white' };
    if (percentage >= 75) return { text: 'Good', color: 'bg-primary text-white' };
    if (percentage >= 60) return { text: 'Fair', color: 'bg-academic-warning text-white' };
    return { text: 'Poor', color: 'bg-destructive text-white' };
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Attendance Tracking
          </h1>
          <p className="text-muted-foreground mt-2">
            Mark and monitor student attendance
          </p>
        </div>
        <ModularButton onClick={saveAttendance} className="gap-2">
          <Save className="w-4 h-4" />
          Save Attendance
        </ModularButton>
      </div>

      <Tabs value={selectedClass} onValueChange={setSelectedClass} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {classes.map(cls => (
            <TabsTrigger key={cls.id} value={cls.id}>
              {cls.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedClass} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="academic-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-3xl font-bold text-primary">{currentClass?.students.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="academic-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Present Today</p>
                    <p className="text-3xl font-bold text-academic-success">
                      {Object.values(attendance).filter(Boolean).length}
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-academic-success opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="academic-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Absent Today</p>
                    <p className="text-3xl font-bold text-destructive">
                      {Object.values(attendance).filter(v => v === false).length}
                    </p>
                  </div>
                  <UserX className="w-8 h-8 text-destructive opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="academic-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Class Average</p>
                    <p className="text-3xl font-bold text-primary">
                      {currentClass && (currentClass.students.reduce((acc, s) => acc + s.percentage, 0) / currentClass.students.length).toFixed(0)}%
                    </p>
                  </div>
                  <CalendarDays className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose date to mark attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  className="rounded-md border"
                />
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">{currentClass?.schedule}</p>
                </div>
              </CardContent>
            </Card>

            {/* Mark Attendance */}
            <Card className="academic-card lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mark Attendance</CardTitle>
                    <CardDescription>
                      {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </div>
                  <ModularButton variant="outline" onClick={markAllPresent}>
                    Mark All Present
                  </ModularButton>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentClass?.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={attendance[student.id] || false}
                        onCheckedChange={() => toggleAttendance(student.id)}
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Attendance: {student.attended}/{student.totalClasses} ({student.percentage}%)
                        </p>
                      </div>
                    </div>
                    <Badge className={getAttendanceBadge(student.percentage).color}>
                      {getAttendanceBadge(student.percentage).text}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Attendance Statistics */}
          <Card className="academic-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance Statistics</CardTitle>
                  <CardDescription>Overall attendance records</CardDescription>
                </div>
                <ModularButton variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </ModularButton>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Present</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Total Classes</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Percentage</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClass?.students.map((student) => {
                      const badge = getAttendanceBadge(student.percentage);
                      return (
                        <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{student.name}</td>
                          <td className="text-center py-3 px-4">{student.attended}</td>
                          <td className="text-center py-3 px-4">{student.totalClasses}</td>
                          <td className="text-center py-3 px-4">
                            <span className={`font-bold ${getAttendanceColor(student.percentage)}`}>
                              {student.percentage}%
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge className={badge.color}>{badge.text}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceTracking;