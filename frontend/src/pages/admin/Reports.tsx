import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModularButton from '@/components/ui/modular-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, TrendingUp, Users, DollarSign, BookOpen, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Reports: React.FC = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const reportTypes = [
    { id: 'enrollment', name: 'Enrollment Report', icon: Users, color: 'text-primary' },
    { id: 'financial', name: 'Financial Report', icon: DollarSign, color: 'text-academic-success' },
    { id: 'academic', name: 'Academic Performance', icon: TrendingUp, color: 'text-accent' },
    { id: 'attendance', name: 'Attendance Report', icon: Calendar, color: 'text-academic-warning' },
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Q4 2024 Enrollment Report',
      type: 'Enrollment',
      generated: '2024-12-01',
      size: '2.4 MB',
      status: 'Ready'
    },
    {
      id: 2,
      name: 'November 2024 Financial Summary',
      type: 'Financial',
      generated: '2024-12-01',
      size: '1.8 MB',
      status: 'Ready'
    },
    {
      id: 3,
      name: 'Fall 2024 Academic Performance',
      type: 'Academic',
      generated: '2024-11-30',
      size: '3.2 MB',
      status: 'Ready'
    },
    {
      id: 4,
      name: 'November 2024 Attendance Analysis',
      type: 'Attendance',
      generated: '2024-11-29',
      size: '1.5 MB',
      status: 'Ready'
    },
  ];

  const metrics = {
    monthly: {
      enrollment: { current: 2550, previous: 2480, change: 2.8 },
      revenue: { current: 450000, previous: 430000, change: 4.7 },
      gpa: { current: 3.42, previous: 3.38, change: 1.2 },
      attendance: { current: 94.2, previous: 93.8, change: 0.4 },
    },
    quarterly: {
      enrollment: { current: 2550, previous: 2400, change: 6.3 },
      revenue: { current: 1350000, previous: 1250000, change: 8.0 },
      gpa: { current: 3.42, previous: 3.35, change: 2.1 },
      attendance: { current: 94.2, previous: 92.5, change: 1.8 },
    },
    yearly: {
      enrollment: { current: 2550, previous: 2200, change: 15.9 },
      revenue: { current: 5400000, previous: 4800000, change: 12.5 },
      gpa: { current: 3.42, previous: 3.30, change: 3.6 },
      attendance: { current: 94.2, previous: 91.8, change: 2.6 },
    },
  };

  const currentMetrics = metrics[selectedPeriod as keyof typeof metrics];

  const handleDownloadReport = (reportName: string) => {
    toast({
      title: "Success",
      description: `Downloading ${reportName}`,
    });
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Success",
      description: `Generating ${reportType} report...`,
    });
  };

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-academic-success' : 'text-destructive';
  };

  const getTrendIcon = (change: number) => {
    return change >= 0 ? '↑' : '↓';
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate and view comprehensive institutional reports
        </p>
      </div>

      {/* Period Selector */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="academic-card border-primary/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Enrollment</p>
                    <Users className="w-5 h-5 text-primary opacity-50" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{currentMetrics.enrollment.current}</p>
                  <p className={`text-sm font-medium ${getTrendColor(currentMetrics.enrollment.change)}`}>
                    {getTrendIcon(currentMetrics.enrollment.change)} {Math.abs(currentMetrics.enrollment.change)}% from last period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card border-academic-success/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <DollarSign className="w-5 h-5 text-academic-success opacity-50" />
                  </div>
                  <p className="text-3xl font-bold text-academic-success">
                    ${(currentMetrics.revenue.current / 1000).toFixed(0)}K
                  </p>
                  <p className={`text-sm font-medium ${getTrendColor(currentMetrics.revenue.change)}`}>
                    {getTrendIcon(currentMetrics.revenue.change)} {Math.abs(currentMetrics.revenue.change)}% from last period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card border-accent/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Avg GPA</p>
                    <TrendingUp className="w-5 h-5 text-accent opacity-50" />
                  </div>
                  <p className="text-3xl font-bold text-accent">{currentMetrics.gpa.current}</p>
                  <p className={`text-sm font-medium ${getTrendColor(currentMetrics.gpa.change)}`}>
                    {getTrendIcon(currentMetrics.gpa.change)} {Math.abs(currentMetrics.gpa.change)}% from last period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card border-academic-warning/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <Calendar className="w-5 h-5 text-academic-warning opacity-50" />
                  </div>
                  <p className="text-3xl font-bold text-academic-warning">{currentMetrics.attendance.current}%</p>
                  <p className={`text-sm font-medium ${getTrendColor(currentMetrics.attendance.change)}`}>
                    {getTrendIcon(currentMetrics.attendance.change)} {Math.abs(currentMetrics.attendance.change)}% from last period
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Reports */}
      <Card className="academic-card">
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Create custom reports for different metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className="p-6 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleGenerateReport(report.name)}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-background rounded-lg">
                    <report.icon className={`w-8 h-8 ${report.color}`} />
                  </div>
                  <h3 className="font-medium">{report.name}</h3>
                  <ModularButton size="sm" className="w-full">
                    Generate
                  </ModularButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="academic-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports ready for download</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.size} • Generated {report.generated}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-academic-success text-white">
                    {report.status}
                  </Badge>
                  <ModularButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(report.name)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </ModularButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;