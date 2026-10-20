import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModularButton from '@/components/ui/modular-button';
import { Calendar, Clock, MapPin, Users, Video, Bell } from 'lucide-react';

const Schedule: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const schedule = {
    Monday: [
      { time: '9:00 AM - 10:30 AM', course: 'CS-301: Data Structures', room: 'Room 204', students: 45, type: 'lecture' },
      { time: '11:00 AM - 12:00 PM', course: 'Office Hours', room: 'Office 512', students: null, type: 'office' },
      { time: '2:00 PM - 3:30 PM', course: 'CS-201: Programming', room: 'Lab 3', students: 30, type: 'lab' },
    ],
    Tuesday: [
      { time: '10:00 AM - 11:30 AM', course: 'CS-401: Advanced Algorithms', room: 'Room 305', students: 28, type: 'lecture' },
      { time: '1:00 PM - 2:00 PM', course: 'Department Meeting', room: 'Conference Room', students: null, type: 'meeting' },
      { time: '3:00 PM - 4:30 PM', course: 'CS-301: Data Structures', room: 'Room 204', students: 45, type: 'tutorial' },
    ],
    Wednesday: [
      { time: '9:00 AM - 10:30 AM', course: 'CS-301: Data Structures', room: 'Room 204', students: 45, type: 'lecture' },
      { time: '11:00 AM - 12:00 PM', course: 'Office Hours', room: 'Office 512', students: null, type: 'office' },
      { time: '2:00 PM - 3:30 PM', course: 'Research Lab', room: 'Lab 5', students: null, type: 'research' },
    ],
    Thursday: [
      { time: '10:00 AM - 11:30 AM', course: 'CS-401: Advanced Algorithms', room: 'Room 305', students: 28, type: 'lecture' },
      { time: '1:00 PM - 2:30 PM', course: 'Faculty Seminar', room: 'Auditorium', students: null, type: 'seminar' },
      { time: '3:00 PM - 4:00 PM', course: 'Student Consultations', room: 'Office 512', students: null, type: 'office' },
    ],
    Friday: [
      { time: '9:00 AM - 10:30 AM', course: 'CS-301: Data Structures', room: 'Room 204', students: 45, type: 'lecture' },
      { time: '11:00 AM - 12:30 PM', course: 'CS-201: Programming', room: 'Lab 3', students: 30, type: 'lab' },
      { time: '2:00 PM - 3:00 PM', course: 'Office Hours', room: 'Office 512', students: null, type: 'office' },
    ],
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-primary text-white';
      case 'lab': return 'bg-academic-success text-white';
      case 'tutorial': return 'bg-accent text-white';
      case 'office': return 'bg-academic-warning text-white';
      case 'meeting': return 'bg-university-primary-dark text-white';
      case 'research': return 'bg-purple-500 text-white';
      case 'seminar': return 'bg-orange-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture': return <Users className="w-4 h-4" />;
      case 'lab': return <Users className="w-4 h-4" />;
      case 'tutorial': return <Users className="w-4 h-4" />;
      case 'office': return <Clock className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      case 'research': return <Users className="w-4 h-4" />;
      case 'seminar': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const currentSchedule = schedule[selectedDay as keyof typeof schedule];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            My Schedule
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your weekly teaching schedule
          </p>
        </div>
        <ModularButton className="gap-2">
          <Bell className="w-4 h-4" />
          Set Reminders
        </ModularButton>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="academic-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Classes This Week</p>
              <p className="text-3xl font-bold text-primary">15</p>
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Office Hours</p>
              <p className="text-3xl font-bold text-academic-warning">8</p>
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Meetings</p>
              <p className="text-3xl font-bold text-university-primary-dark">4</p>
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Teaching Hours</p>
              <p className="text-3xl font-bold text-academic-success">28</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map(day => (
          <ModularButton
            key={day}
            variant={selectedDay === day ? 'default' : 'outline'}
            onClick={() => setSelectedDay(day)}
            className="whitespace-nowrap"
          >
            {day}
          </ModularButton>
        ))}
      </div>

      {/* Schedule for Selected Day */}
      <div className="space-y-4">
        {currentSchedule.map((item, index) => (
          <Card key={index} className="academic-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeColor(item.type)}>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        {item.type.toUpperCase()}
                      </span>
                    </Badge>
                    <h3 className="text-xl font-bold">{item.course}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{item.room}</span>
                    </div>
                    {item.students && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{item.students} Students</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <ModularButton variant="outline" size="sm">
                    View Details
                  </ModularButton>
                  {item.type === 'lecture' && (
                    <ModularButton size="sm">
                      Start Class
                    </ModularButton>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Classes */}
      <Card className="academic-card">
        <CardHeader>
          <CardTitle>Next Classes</CardTitle>
          <CardDescription>Your upcoming schedule for the next 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentSchedule.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <p className="font-medium">{item.course}</p>
                  <p className="text-sm text-muted-foreground">{item.time} • {item.room}</p>
                </div>
              </div>
              <Badge className={getTypeColor(item.type)}>
                {item.type}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;