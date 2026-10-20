import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Download,
  Filter,
  Search,
  Plus,
  Eye
} from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define proper TypeScript interfaces
interface User {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface FinancialStats {
  totalRevenue: number;
  outstandingPayments: number;
  collectedRevenue: number;
  studentsWithBalance: number;
  revenueGrowth: number;
  collectionRate: number;
  pendingApprovals: number;
}

interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'overdue' | 'pending' | 'partial';
  type: string;
  paidAmount?: number;
  transactionId?: string;
}

interface RevenueTrend {
  month: string;
  revenue: number;
  students: number;
  growth: number;
}

interface FinanceDashboardProps {
  user: User;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ user }) => {
  const [financialStats, setFinancialStats] = useState<FinancialStats>({
    totalRevenue: 0,
    outstandingPayments: 0,
    collectedRevenue: 0,
    studentsWithBalance: 0,
    revenueGrowth: 12.5,
    collectionRate: 0,
    pendingApprovals: 0
  });
  
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Mock data for demo
  const getMockStats = useCallback((): FinancialStats => ({
    totalRevenue: 2450000,
    outstandingPayments: 325000,
    collectedRevenue: 2125000,
    studentsWithBalance: 165,
    revenueGrowth: 12.5,
    collectionRate: 86.7,
    pendingApprovals: 23
  }), []);

  const getMockPayments = useCallback((): Payment[] => [
    { 
      id: 1, 
      studentId: 1001,
      studentName: 'Alex Johnson', 
      studentEmail: 'alex.johnson@university.edu',
      amount: 1250, 
      dueDate: '2024-03-20', 
      status: 'pending', 
      type: 'Tuition Fee',
      transactionId: 'TXN001'
    },
    { 
      id: 2, 
      studentId: 1002,
      studentName: 'Sarah Chen', 
      studentEmail: 'sarah.chen@university.edu',
      amount: 1250, 
      dueDate: '2024-03-15', 
      status: 'overdue', 
      type: 'Tuition Fee',
      transactionId: 'TXN002'
    },
    { 
      id: 3, 
      studentId: 1003,
      studentName: 'Michael Rodriguez', 
      studentEmail: 'michael.r@university.edu',
      amount: 625, 
      dueDate: '2024-03-10', 
      status: 'paid', 
      type: 'Lab Fees',
      paidAmount: 625,
      transactionId: 'TXN003'
    },
    { 
      id: 4, 
      studentId: 1004,
      studentName: 'Emily Watson', 
      studentEmail: 'emily.watson@university.edu',
      amount: 1250, 
      dueDate: '2024-03-18', 
      status: 'partial', 
      type: 'Tuition Fee',
      paidAmount: 625,
      transactionId: 'TXN004'
    },
    { 
      id: 5, 
      studentId: 1005,
      studentName: 'James Wilson', 
      studentEmail: 'james.wilson@university.edu',
      amount: 250, 
      dueDate: '2024-03-12', 
      status: 'paid', 
      type: 'Library Fine',
      paidAmount: 250,
      transactionId: 'TXN005'
    },
    { 
      id: 6, 
      studentId: 1006,
      studentName: 'Priya Patel', 
      studentEmail: 'priya.patel@university.edu',
      amount: 850, 
      dueDate: '2024-03-25', 
      status: 'pending', 
      type: 'Hostel Fees',
      transactionId: 'TXN006'
    }
  ], []);

  const getMockTrends = useCallback((): RevenueTrend[] => [
    { month: 'Jan', revenue: 1850000, students: 1150, growth: 8.2 },
    { month: 'Feb', revenue: 1950000, students: 1180, growth: 5.4 },
    { month: 'Mar', revenue: 2450000, students: 1247, growth: 25.6 },
    { month: 'Apr', revenue: 2100000, students: 1220, growth: -14.3 },
    { month: 'May', revenue: 1950000, students: 1190, growth: -7.1 },
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching finance dashboard data for user:", user);
        
        const [studentsData, paymentsData] = await Promise.all([
  api.getStudents().catch(() => []),
  // Handle missing payment endpoint gracefully
  api.getStudentPayments ? api.getStudentPayments(user.userId).catch(() => getMockPayments()) : Promise.resolve(getMockPayments())
]);

        // Calculate financial stats from student data
        const totalStudents = studentsData?.length || 1247;
        const estimatedRevenue = totalStudents * 1965; // Average tuition per student
        const outstandingPayments = Math.floor(estimatedRevenue * 0.15); // 15% outstanding
        const collectedRevenue = estimatedRevenue - outstandingPayments;
        
        setFinancialStats({
          totalRevenue: estimatedRevenue,
          outstandingPayments: outstandingPayments,
          collectedRevenue: collectedRevenue,
          studentsWithBalance: Math.floor(totalStudents * 0.15),
          revenueGrowth: 12.5,
          collectionRate: (collectedRevenue / estimatedRevenue) * 100,
          pendingApprovals: 23
        });

        setRecentPayments(getMockPayments());
        setRevenueTrends(getMockTrends());
      } catch (error) {
        console.error('❌ Error fetching finance data:', error);
        setFinancialStats(getMockStats());
        setRecentPayments(getMockPayments());
        setRevenueTrends(getMockTrends());
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getMockStats, getMockPayments, getMockTrends]);

  // Filter payments based on search and filters
  const filteredPayments = recentPayments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesDate = dateFilter === 'all' || true; // Simplified date filter
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      case 'partial': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-blue-400" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportReport = () => {
    console.log('📊 Exporting financial report...');
    // In a real app, this would generate and download a report
  };

  const handleProcessPayment = (paymentId: number) => {
    console.log('💳 Processing payment:', paymentId);
    // In a real app, this would open a payment processing modal
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400">Loading finance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Finance Dashboard
        </h1>
        <p className="text-gray-400">
          Financial overview, payment management, and revenue analytics
        </p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(financialStats.totalRevenue)}
            </div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{financialStats.revenueGrowth}% from last year
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(financialStats.outstandingPayments)}
            </div>
            <p className="text-xs text-gray-400">{financialStats.studentsWithBalance} students</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(financialStats.collectedRevenue)}
            </div>
            <p className="text-xs text-gray-400">{financialStats.collectionRate.toFixed(1)}% collection rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {financialStats.pendingApprovals}
            </div>
            <p className="text-xs text-gray-400">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              <span>Revenue Trends</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Monthly revenue and student enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{trend.month} 2024</p>
                    <p className="text-sm text-gray-300">{formatCurrency(trend.revenue)}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs ${trend.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.growth >= 0 ? '↑' : '↓'} {Math.abs(trend.growth)}%
                      </span>
                      <span className="text-xs text-blue-400">{trend.students} students</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-32 bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(trend.revenue / 2500000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 border-gray-600 text-white hover:bg-gray-700"
              onClick={handleExportReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Revenue Report
            </Button>
          </CardContent>
        </Card>

        {/* Payment Management */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-400" />
              <span>Payment Management</span>
              <Badge className="bg-blue-500">{filteredPayments.length}</Badge>
            </CardTitle>
            <CardDescription className="text-gray-400">Manage student payments and invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students or payments..."
                  className="bg-gray-700 border-gray-600 text-white pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{payment.studentName}</p>
                      <p className="text-xs text-gray-400">{payment.studentEmail}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">{payment.type}</span>
                        <span className="text-xs text-gray-400">Due: {payment.dueDate}</span>
                      </div>
                      {payment.paidAmount && payment.status === 'partial' && (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-blue-400">
                            Paid: {formatCurrency(payment.paidAmount)} of {formatCurrency(payment.amount)}
                          </span>
                          <Progress 
                            value={(payment.paidAmount / payment.amount) * 100} 
                            className="h-1 w-16 bg-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold text-white">{formatCurrency(payment.amount)}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleProcessPayment(payment.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700">
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoices
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Collection Progress */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span>Collection Progress</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Current payment collection status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Overall Collection Rate</span>
                <span className="text-green-400">{financialStats.collectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={financialStats.collectionRate} className="h-3 bg-gray-600" />
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Tuition Fees</span>
                <span className="text-blue-400">92.3%</span>
              </div>
              <Progress value={92.3} className="h-2 bg-gray-600" />
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Other Fees</span>
                <span className="text-yellow-400">78.5%</span>
              </div>
              <Progress value={78.5} className="h-2 bg-gray-600" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-xl font-bold text-green-400">
                  {((1247 - financialStats.studentsWithBalance) / 1247 * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-400">Students Paid</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-xl font-bold text-blue-400">
                  {financialStats.studentsWithBalance}
                </div>
                <p className="text-xs text-gray-400">With Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Reports */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-400" />
              <span>Financial Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-gray-600 text-white hover:bg-gray-700">
                <FileText className="h-4 w-4 mr-2" />
                Monthly Revenue Report
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-600 text-white hover:bg-gray-700">
                <Users className="h-4 w-4 mr-2" />
                Student Payment Status
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-600 text-white hover:bg-gray-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Outstanding Payments
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-600 text-white hover:bg-gray-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                Financial Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-600 text-white hover:bg-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Due Dates
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;