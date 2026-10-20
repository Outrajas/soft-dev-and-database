import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import StatCard from '@/components/ui/stat-card';
import ModularButton from '@/components/ui/modular-button';
import { FileText, DollarSign, Clock, CheckCircle, Search, Download, Send } from 'lucide-react';

const InvoiceManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const mockInvoices = [
    {
      id: 'INV-2025-001',
      student: 'John Smith',
      studentId: 'S2024001',
      type: 'Tuition Fee',
      amount: 5250.00,
      issued: '2025-09-01',
      due: '2025-10-15',
      status: 'pending',
      semester: 'Fall 2025'
    },
    {
      id: 'INV-2025-002',
      student: 'Emma Johnson',
      studentId: 'S2024002',
      type: 'Housing',
      amount: 3200.00,
      issued: '2025-09-01',
      due: '2025-10-20',
      status: 'overdue',
      semester: 'Fall 2025'
    },
    {
      id: 'INV-2025-003',
      student: 'Michael Chen',
      studentId: 'S2024003',
      type: 'Meal Plan',
      amount: 1850.00,
      issued: '2025-09-05',
      paid: '2025-09-20',
      status: 'paid',
      semester: 'Fall 2025'
    },
    {
      id: 'INV-2025-004',
      student: 'Sarah Williams',
      studentId: 'S2024004',
      type: 'Tuition Fee',
      amount: 5250.00,
      issued: '2025-09-01',
      paid: '2025-09-28',
      status: 'paid',
      semester: 'Fall 2025'
    },
    {
      id: 'INV-2025-005',
      student: 'David Park',
      studentId: 'S2024005',
      type: 'Lab Fees',
      amount: 450.00,
      issued: '2025-09-10',
      due: '2025-10-25',
      status: 'pending',
      semester: 'Fall 2025'
    },
  ];

  const totalRevenue = mockInvoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPending = mockInvoices
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0);

  const overdueAmount = mockInvoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return Clock;
      default: return FileText;
    }
  };

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Invoice Management
        </h1>
        <p className="text-muted-foreground">
          Create, track, and manage student invoices and payments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Collected"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="success"
          glow
        />
        <StatCard
          title="Pending"
          value={`$${totalPending.toLocaleString()}`}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Overdue"
          value={`$${overdueAmount.toLocaleString()}`}
          icon={FileText}
          color="error"
        />
        <StatCard
          title="Total Invoices"
          value={mockInvoices.length.toString()}
          icon={FileText}
          color="primary"
        />
      </div>

      {/* Filters */}
      <Card className="academic-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <ModularButton glow>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </ModularButton>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="academic-card">
        <CardHeader>
          <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
          <CardDescription>Manage and track student invoices</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => {
              const StatusIcon = getStatusIcon(invoice.status);
              const isOverdue = invoice.status === 'overdue';

              return (
                <div
                  key={invoice.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isOverdue ? 'border-academic-error bg-academic-error/5' : 'border-border bg-muted/30'
                  } hover:bg-muted/50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {invoice.id}
                        </Badge>
                        <Badge color={getStatusColor(invoice.status)} className="flex items-center space-x-1">
                          <StatusIcon className="h-3 w-3" />
                          <span className="uppercase">{invoice.status}</span>
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-lg">{invoice.student}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.studentId} • {invoice.type} • {invoice.semester}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Issued: {invoice.issued}</span>
                        {invoice.status === 'paid' && invoice.paid && (
                          <>
                            <span>•</span>
                            <span>Paid: {invoice.paid}</span>
                          </>
                        )}
                        {(invoice.status === 'pending' || invoice.status === 'overdue') && invoice.due && (
                          <>
                            <span>•</span>
                            <span className={isOverdue ? 'text-academic-error font-medium' : ''}>
                              Due: {invoice.due}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-3 ml-4">
                      <p className={`text-2xl font-bold ${
                        invoice.status === 'paid' ? 'text-academic-success' :
                        isOverdue ? 'text-academic-error' : 'text-primary'
                      }`}>
                        ${invoice.amount.toLocaleString()}
                      </p>
                      
                      <div className="flex space-x-2">
                        <ModularButton variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </ModularButton>
                        {invoice.status !== 'paid' && (
                          <ModularButton variant="outline" size="sm">
                            <Send className="h-3 w-3" />
                          </ModularButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceManagement;
