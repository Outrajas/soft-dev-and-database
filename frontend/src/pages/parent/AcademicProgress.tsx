import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Award, BookOpen, Target, Calendar } from 'lucide-react';

const AcademicProgress: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState('sarah');

  const childrenData = {
    sarah: {
      name: 'Sarah Johnson',
      class: '10th Grade',
      overallGPA: 3.8,
      attendance: 95,
      subjects: [
        { name: 'Mathematics', grade: 'A', percentage: 92, trend: 'up', teacher: 'Dr. Smith' },
        { name: 'Physics', grade: 'A-', percentage: 88, trend: 'up', teacher: 'Prof. Johnson' },
        { name: 'Chemistry', grade: 'B+', percentage: 85, trend: 'stable', teacher: 'Dr. Williams' },
        { name: 'English', grade: 'A', percentage: 94, trend: 'up', teacher: 'Ms. Davis' },
        { name: 'History', grade: 'B+', percentage: 87, trend: 'down', teacher: 'Mr. Brown' },
      ],
      recentTests: [
        { subject: 'Mathematics', name: 'Calculus Quiz', score: 95, maxScore: 100, date: '2024-09-20' },
        { subject: 'Physics', name: 'Mechanics Test', score: 88, maxScore: 100, date: '2024-09-18' },
        { subject: 'Chemistry', name: 'Organic Chemistry', score: 82, maxScore: 100, date: '2024-09-15' },
      ],
      achievements: [
        { title: 'Honor Roll', date: '2024-09-01', description: 'Achieved GPA > 3.5' },
        { title: 'Science Fair Winner', date: '2024-08-15', description: 'First place in regional competition' },
        { title: 'Perfect Attendance', date: '2024-08-01', description: 'No absences in August' },
      ]
    },
    michael: {
      name: 'Michael Johnson',
      class: '7th Grade',
      overallGPA: 3.6,
      attendance: 92,
      subjects: [
        { name: 'Mathematics', grade: 'B+', percentage: 87, trend: 'up', teacher: 'Ms. Anderson' },
        { name: 'Science', grade: 'A-', percentage: 90, trend: 'up', teacher: 'Dr. Wilson' },
        { name: 'English', grade: 'B', percentage: 83, trend: 'stable', teacher: 'Mrs. Taylor' },
        { name: 'Social Studies', grade: 'A', percentage: 92, trend: 'up', teacher: 'Mr. Martinez' },
        { name: 'Art', grade: 'A', percentage: 95, trend: 'up', teacher: 'Ms. Lee' },
      ],
      recentTests: [
        { subject: 'Mathematics', name: 'Algebra Test', score: 85, maxScore: 100, date: '2024-09-19' },
        { subject: 'Science', name: 'Biology Quiz', score: 92, maxScore: 100, date: '2024-09-17' },
        { subject: 'English', name: 'Essay', score: 80, maxScore: 100, date: '2024-09-14' },
      ],
      achievements: [
        { title: 'Art Competition Winner', date: '2024-09-05', description: 'First place in school art contest' },
        { title: 'Good Conduct Award', date: '2024-08-20', description: 'Exemplary behavior' },
      ]
    }
  };

  const currentChild = childrenData[selectedChild as keyof typeof childrenData];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-academic-success" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <div className="w-4 h-4" />;
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-academic-success';
    if (grade.startsWith('B')) return 'text-primary';
    if (grade.startsWith('C')) return 'text-academic-warning';
    return 'text-destructive';
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Academic Progress
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your children's academic performance and achievements
        </p>
      </div>

      {/* Child Selector */}
      <Tabs value={selectedChild} onValueChange={setSelectedChild} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sarah">Sarah</TabsTrigger>
          <TabsTrigger value="michael">Michael</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedChild} className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="academic-card border-primary/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall GPA</p>
                    <p className="text-3xl font-bold text-primary">{currentChild.overallGPA}</p>
                  </div>
                  <Target className="w-10 h-10 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="academic-card border-academic-success/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="text-3xl font-bold text-academic-success">{currentChild.attendance}%</p>
                  </div>
                  <Calendar className="w-10 h-10 text-academic-success opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="academic-card border-accent/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="text-2xl font-bold text-accent">{currentChild.class}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-accent opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subjects Performance */}
          <Card className="academic-card">
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Current grades and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentChild.subjects.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{subject.name}</span>
                      <Badge className={getGradeColor(subject.grade)}>
                        {subject.grade}
                      </Badge>
                      {getTrendIcon(subject.trend)}
                    </div>
                    <span className="text-sm text-muted-foreground">{subject.teacher}</span>
                  </div>
                  <Progress value={subject.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{subject.percentage}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Tests */}
          <Card className="academic-card">
            <CardHeader>
              <CardTitle>Recent Tests & Assessments</CardTitle>
              <CardDescription>Latest exam results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentChild.recentTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">{test.subject}</p>
                    <p className="text-xs text-muted-foreground">{test.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{test.score}</p>
                    <p className="text-sm text-muted-foreground">/ {test.maxScore}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((test.score / test.maxScore) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="academic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-academic-warning" />
                Achievements & Awards
              </CardTitle>
              <CardDescription>Recent accomplishments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentChild.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-academic-warning/20 rounded-lg">
                    <Award className="w-6 h-6 text-academic-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicProgress;