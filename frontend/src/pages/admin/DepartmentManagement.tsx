import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModularButton from '@/components/ui/modular-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Edit, Users, BookOpen, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DepartmentManagement: React.FC = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const departments = [
    {
      id: 1,
      name: 'Computer Science',
      head: 'Dr. Robert Smith',
      faculty: 25,
      students: 450,
      courses: 45,
      budget: 2500000,
      building: 'Engineering Building',
      established: 1995
    },
    {
      id: 2,
      name: 'Mathematics',
      head: 'Prof. Sarah Johnson',
      faculty: 18,
      students: 320,
      courses: 35,
      budget: 1800000,
      building: 'Science Complex',
      established: 1990
    },
    {
      id: 3,
      name: 'Physics',
      head: 'Dr. Michael Brown',
      faculty: 20,
      students: 280,
      courses: 30,
      budget: 2200000,
      building: 'Science Complex',
      established: 1992
    },
    {
      id: 4,
      name: 'English',
      head: 'Prof. Emily Davis',
      faculty: 15,
      students: 380,
      courses: 40,
      budget: 1500000,
      building: 'Humanities Hall',
      established: 1988
    },
    {
      id: 5,
      name: 'Business Administration',
      head: 'Dr. James Wilson',
      faculty: 22,
      students: 520,
      courses: 50,
      budget: 2800000,
      building: 'Business School',
      established: 2000
    },
    {
      id: 6,
      name: 'Engineering',
      head: 'Prof. David Martinez',
      faculty: 30,
      students: 600,
      courses: 55,
      budget: 3500000,
      building: 'Engineering Building',
      established: 1993
    },
  ];

  const handleAddDepartment = () => {
    toast({
      title: "Success",
      description: "New department created successfully",
    });
    setIsDialogOpen(false);
  };

  const handleEditDepartment = (deptName: string) => {
    toast({
      title: "Info",
      description: `Editing ${deptName} department`,
    });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Department Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Oversee and manage all academic departments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <ModularButton className="gap-2">
              <Plus className="w-4 h-4" />
              Add Department
            </ModularButton>
          </DialogTrigger>
          <DialogContent className="academic-card sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new academic department
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Department Name</Label>
                <Input placeholder="e.g., Computer Science" />
              </div>
              <div className="space-y-2">
                <Label>Department Head</Label>
                <Input placeholder="e.g., Dr. John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Building</Label>
                <Input placeholder="e.g., Science Complex" />
              </div>
              <div className="space-y-2">
                <Label>Annual Budget</Label>
                <Input type="number" placeholder="2500000" />
              </div>
              <ModularButton onClick={handleAddDepartment} className="w-full">
                Create Department
              </ModularButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="academic-card border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Departments</p>
                <p className="text-3xl font-bold text-primary">{departments.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-academic-success/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Faculty</p>
                <p className="text-3xl font-bold text-academic-success">
                  {departments.reduce((acc, d) => acc + d.faculty, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-academic-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-accent/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-accent">
                  {departments.reduce((acc, d) => acc + d.students, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-university-primary-dark/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-university-primary-dark">
                  ${(departments.reduce((acc, d) => acc + d.budget, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-university-primary-dark opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="academic-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{dept.name}</CardTitle>
                    <CardDescription>Head: {dept.head}</CardDescription>
                  </div>
                </div>
                <ModularButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditDepartment(dept.name)}
                >
                  <Edit className="w-4 h-4" />
                </ModularButton>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Users className="w-5 h-5 mx-auto mb-1 text-academic-success" />
                  <p className="text-2xl font-bold text-academic-success">{dept.faculty}</p>
                  <p className="text-xs text-muted-foreground">Faculty</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold text-primary">{dept.students}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <BookOpen className="w-5 h-5 mx-auto mb-1 text-accent" />
                  <p className="text-2xl font-bold text-accent">{dept.courses}</p>
                  <p className="text-xs text-muted-foreground">Courses</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Building:</span>
                  <span className="font-medium">{dept.building}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established:</span>
                  <span className="font-medium">{dept.established}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Budget:</span>
                  <span className="font-medium text-university-primary-dark">
                    ${(dept.budget / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student/Faculty Ratio:</span>
                  <span className="font-medium">
                    {(dept.students / dept.faculty).toFixed(1)}:1
                  </span>
                </div>
              </div>

              <ModularButton className="w-full" onClick={() => handleEditDepartment(dept.name)}>
                View Details
              </ModularButton>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManagement;