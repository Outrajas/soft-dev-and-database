import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModularButton from '@/components/ui/modular-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Save, Upload, Download, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GradeManagement: React.FC = () => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('CS-301');
  const [editingGrade, setEditingGrade] = useState<any>(null);

  const classes = [
    {
      id: 'CS-301',
      name: 'Data Structures',
      students: [
        { id: 1, name: 'John Smith', midterm: 85, assignments: 90, project: 88, final: null, overall: 87.7 },
        { id: 2, name: 'Emma Wilson', midterm: 92, assignments: 95, project: 90, final: null, overall: 92.3 },
        { id: 3, name: 'Michael Brown', midterm: 78, assignments: 82, project: 85, final: null, overall: 81.7 },
        { id: 4, name: 'Sarah Davis', midterm: 88, assignments: 92, project: 87, final: null, overall: 89.0 },
        { id: 5, name: 'James Johnson', midterm: 95, assignments: 98, project: 96, final: null, overall: 96.3 },
      ]
    },
    {
      id: 'CS-401',
      name: 'Advanced Algorithms',
      students: [
        { id: 6, name: 'Alice Cooper', midterm: 90, assignments: 88, project: 92, final: null, overall: 90.0 },
        { id: 7, name: 'Bob Martinez', midterm: 82, assignments: 85, project: 80, final: null, overall: 82.3 },
        { id: 8, name: 'Carol White', midterm: 94, assignments: 96, project: 95, final: null, overall: 95.0 },
      ]
    }
  ];

  const currentClass = classes.find(c => c.id === selectedClass);

  const getLetterGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'bg-academic-success text-white' };
    if (score >= 80) return { grade: 'B', color: 'bg-primary text-white' };
    if (score >= 70) return { grade: 'C', color: 'bg-academic-warning text-white' };
    if (score >= 60) return { grade: 'D', color: 'bg-orange-500 text-white' };
    return { grade: 'F', color: 'bg-destructive text-white' };
  };

  const handleSaveGrade = () => {
    toast({
      title: "Success",
      description: "Grade updated successfully",
    });
    setEditingGrade(null);
  };

  const handleExport = () => {
    toast({
      title: "Success",
      description: "Grades exported successfully",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Grade Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and track student grades across all courses
          </p>
        </div>
        <div className="flex gap-2">
          <ModularButton variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </ModularButton>
          <ModularButton className="gap-2">
            <Upload className="w-4 h-4" />
            Import Grades
          </ModularButton>
        </div>
      </div>

      {/* Class Selector */}
      <Tabs value={selectedClass} onValueChange={setSelectedClass} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {classes.map(cls => (
            <TabsTrigger key={cls.id} value={cls.id}>
              {cls.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedClass} className="space-y-6">
          {/* Class Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="academic-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-primary">{currentClass?.students.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="academic-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Class Average</p>
                  <p className="text-3xl font-bold text-academic-success">
                    {currentClass && (currentClass.students.reduce((acc, s) => acc + s.overall, 0) / currentClass.students.length).toFixed(1)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="academic-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Graded</p>
                  <p className="text-3xl font-bold text-primary">
                    {currentClass?.students.filter(s => s.final !== null).length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="academic-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-academic-warning">
                    {currentClass?.students.filter(s => s.final === null).length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Grades Table */}
          <Card className="academic-card">
            <CardHeader>
              <CardTitle>Student Grades</CardTitle>
              <CardDescription>View and edit individual student grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Midterm</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Assignments</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Project</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Final</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Overall</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Grade</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClass?.students.map((student) => {
                      const { grade, color } = getLetterGrade(student.overall);
                      return (
                        <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{student.name}</td>
                          <td className="text-center py-3 px-4">{student.midterm}</td>
                          <td className="text-center py-3 px-4">{student.assignments}</td>
                          <td className="text-center py-3 px-4">{student.project}</td>
                          <td className="text-center py-3 px-4">
                            {student.final || <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="text-center py-3 px-4 font-bold text-primary">
                            {student.overall.toFixed(1)}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge className={color}>{grade}</Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <ModularButton 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingGrade(student)}
                                >
                                  <Edit className="w-4 h-4" />
                                </ModularButton>
                              </DialogTrigger>
                              <DialogContent className="academic-card">
                                <DialogHeader>
                                  <DialogTitle>Edit Grades - {student.name}</DialogTitle>
                                  <DialogDescription>
                                    Update individual component grades
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Midterm Score</Label>
                                    <Input type="number" defaultValue={student.midterm} max={100} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Assignments Score</Label>
                                    <Input type="number" defaultValue={student.assignments} max={100} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Project Score</Label>
                                    <Input type="number" defaultValue={student.project} max={100} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Final Exam Score</Label>
                                    <Input type="number" defaultValue={student.final || ''} max={100} placeholder="Not graded yet" />
                                  </div>
                                  <ModularButton onClick={handleSaveGrade} className="w-full gap-2">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                  </ModularButton>
                                </div>
                              </DialogContent>
                            </Dialog>
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

export default GradeManagement;