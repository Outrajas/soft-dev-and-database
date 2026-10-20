import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/ui/stat-card';
import { TrendingUp, Award, BookOpen, Target, Download, FileText } from 'lucide-react';
import ModularButton from '@/components/ui/modular-button';

const Grades: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState('fall-2025');

  const mockGrades = [
    {
      courseId: 'CS101',
      courseName: 'Introduction to Computer Science',
      instructor: 'Dr. Sarah Johnson',
      credits: 4,
      grade: 'A',
      gpa: 4.0,
      percentage: 94,
      components: [
        { name: 'Assignments', weight: 30, score: 95, maxScore: 100 },
        { name: 'Midterm Exam', weight: 25, score: 92, maxScore: 100 },
        { name: 'Final Project', weight: 30, score: 96, maxScore: 100 },
        { name: 'Participation', weight: 15, score: 90, maxScore: 100 },
      ]
    },
    {
      courseId: 'MATH201',
      courseName: 'Calculus II',
      instructor: 'Prof. Michael Chen',
      credits: 3,
      grade: 'B+',
      gpa: 3.3,
      percentage: 87,
      components: [
        { name: 'Homework', weight: 20, score: 88, maxScore: 100 },
        { name: 'Quizzes', weight: 20, score: 85, maxScore: 100 },
        { name: 'Midterm', weight: 30, score: 84, maxScore: 100 },
        { name: 'Final Exam', weight: 30, score: 90, maxScore: 100 },
      ]
    },
    {
      courseId: 'ENG105',
      courseName: 'Academic Writing',
      instructor: 'Dr. Emily Rodriguez',
      credits: 3,
      grade: 'A-',
      gpa: 3.7,
      percentage: 91,
      components: [
        { name: 'Essays', weight: 50, score: 92, maxScore: 100 },
        { name: 'Drafts', weight: 20, score: 88, maxScore: 100 },
        { name: 'Presentations', weight: 20, score: 94, maxScore: 100 },
        { name: 'Participation', weight: 10, score: 90, maxScore: 100 },
      ]
    },
    {
      courseId: 'PHY102',
      courseName: 'Physics I - Mechanics',
      instructor: 'Dr. Robert Kumar',
      credits: 4,
      grade: 'B',
      gpa: 3.0,
      percentage: 83,
      components: [
        { name: 'Lab Reports', weight: 30, score: 85, maxScore: 100 },
        { name: 'Problem Sets', weight: 20, score: 80, maxScore: 100 },
        { name: 'Midterm', weight: 25, score: 78, maxScore: 100 },
        { name: 'Final Exam', weight: 25, score: 88, maxScore: 100 },
      ]
    }
  ];

  const calculateSemesterGPA = () => {
    const totalPoints = mockGrades.reduce((acc, course) => acc + (course.gpa * course.credits), 0);
    const totalCredits = mockGrades.reduce((acc, course) => acc + course.credits, 0);
    return (totalPoints / totalCredits).toFixed(2);
  };

  const calculateCumulativeGPA = () => {
    // Mock cumulative GPA
    return '3.65';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'primary';
    if (grade.startsWith('C')) return 'warning';
    return 'error';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          My Grades
        </h1>
        <p className="text-muted-foreground">
          Track your academic performance and view detailed grade breakdowns
        </p>
      </div>

      {/* GPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Semester GPA"
          value={calculateSemesterGPA()}
          icon={TrendingUp}
          color="primary"
          glow
          trend={{ value: 5.2, label: 'vs last semester' }}
        />
        <StatCard
          title="Cumulative GPA"
          value={calculateCumulativeGPA()}
          icon={Award}
          color="success"
        />
        <StatCard
          title="Total Credits"
          value={mockGrades.reduce((acc, c) => acc + c.credits, 0)}
          icon={BookOpen}
          color="warning"
        />
        <StatCard
          title="Courses"
          value={mockGrades.length}
          icon={Target}
          color="primary"
        />
      </div>

      {/* Semester Selector */}
      <Card className="academic-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Academic Records</CardTitle>
              <CardDescription>View grades by semester</CardDescription>
            </div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="fall-2025">Fall 2025</option>
              <option value="spring-2025">Spring 2025</option>
              <option value="fall-2024">Fall 2024</option>
              <option value="spring-2024">Spring 2024</option>
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Grade Cards */}
      <div className="space-y-4">
        {mockGrades.map((course) => (
          <Card key={course.courseId} className="academic-card group hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-xl">{course.courseName}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <span>{course.instructor}</span>
                    <span>•</span>
                    <span>{course.credits} Credits</span>
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className="text-lg px-4 py-1" color={getGradeColor(course.grade)}>
                    {course.grade}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{course.percentage}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Grade Components */}
              <div className="space-y-3">
                {course.components.map((component, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{component.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {component.weight}%
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {component.score}/{component.maxScore}
                      </span>
                    </div>
                    <Progress 
                      value={(component.score / component.maxScore) * 100} 
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <ModularButton variant="outline" size="sm" glow>
                  <FileText className="h-4 w-4 mr-2" />
                  View Feedback
                </ModularButton>
                <ModularButton variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </ModularButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* GPA Trend Chart Placeholder */}
      <Card className="academic-card">
        <CardHeader>
          <CardTitle>GPA Trend</CardTitle>
          <CardDescription>Your academic performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border border-dashed border-border">
            <div className="text-center space-y-2">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">GPA visualization coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Grades;
