import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModularButton from '@/components/ui/modular-button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Download, Eye, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import paymentQR from '@/assets/payment-qr.jpg';

const FeePayments: React.FC = () => {
  const [showQR, setShowQR] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const children = [
    { id: 1, name: 'Sarah Johnson', studentId: 'STU-2024-001', class: '10th Grade' },
    { id: 2, name: 'Michael Johnson', studentId: 'STU-2024-045', class: '7th Grade' },
  ];

  const invoices = [
    {
      id: 'INV-2024-001',
      childName: 'Sarah Johnson',
      term: 'Fall 2024',
      dueDate: '2024-09-15',
      amount: 3500,
      status: 'paid',
      paidDate: '2024-09-10',
      items: [
        { description: 'Tuition Fee', amount: 2500 },
        { description: 'Lab Fee', amount: 500 },
        { description: 'Library Fee', amount: 300 },
        { description: 'Sports Fee', amount: 200 },
      ]
    },
    {
      id: 'INV-2024-002',
      childName: 'Michael Johnson',
      term: 'Fall 2024',
      dueDate: '2024-09-15',
      amount: 3200,
      status: 'paid',
      paidDate: '2024-09-12',
      items: [
        { description: 'Tuition Fee', amount: 2300 },
        { description: 'Lab Fee', amount: 400 },
        { description: 'Library Fee', amount: 300 },
        { description: 'Sports Fee', amount: 200 },
      ]
    },
    {
      id: 'INV-2024-003',
      childName: 'Sarah Johnson',
      term: 'Spring 2025',
      dueDate: '2025-01-15',
      amount: 3500,
      status: 'pending',
      items: [
        { description: 'Tuition Fee', amount: 2500 },
        { description: 'Lab Fee', amount: 500 },
        { description: 'Library Fee', amount: 300 },
        { description: 'Sports Fee', amount: 200 },
      ]
    },
    {
      id: 'INV-2024-004',
      childName: 'Michael Johnson',
      term: 'Spring 2025',
      dueDate: '2025-01-15',
      amount: 3200,
      status: 'overdue',
      items: [
        { description: 'Tuition Fee', amount: 2300 },
        { description: 'Lab Fee', amount: 400 },
        { description: 'Library Fee', amount: 300 },
        { description: 'Sports Fee', amount: 200 },
      ]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-academic-success text-white';
      case 'pending': return 'bg-academic-warning text-white';
      case 'overdue': return 'bg-destructive text-white';
      default: return 'bg-muted';
    }
  };

  const handlePayNow = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowQR(true);
  };

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Fee Payments
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage tuition and fee payments for your children
          </p>
        </div>
        <ModularButton onClick={() => setShowQR(true)} className="gap-2">
          <CreditCard className="w-4 h-4" />
          Make Payment
        </ModularButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="academic-card border-academic-success/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-academic-success">$6,700</p>
              </div>
              <DollarSign className="w-8 h-8 text-academic-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-academic-warning/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-academic-warning">$3,500</p>
              </div>
              <Calendar className="w-8 h-8 text-academic-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">$3,200</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold text-primary">$6,700</p>
              </div>
              <CreditCard className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices by Child */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="sarah">Sarah</TabsTrigger>
          <TabsTrigger value="michael">Michael</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="academic-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{invoice.id}</CardTitle>
                    <CardDescription>
                      {invoice.childName} - {invoice.term}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{invoice.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-xl font-bold text-primary">${invoice.amount}</span>
                  </div>
                  {invoice.status === 'paid' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Paid Date:</span>
                      <span className="font-medium text-academic-success">{invoice.paidDate}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <ModularButton 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleViewDetails(invoice)}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </ModularButton>
                    {invoice.status === 'paid' ? (
                      <ModularButton variant="outline" className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Download Receipt
                      </ModularButton>
                    ) : (
                      <ModularButton 
                        className="flex-1 gap-2"
                        onClick={() => handlePayNow(invoice)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </ModularButton>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sarah" className="space-y-4">
          {invoices.filter(inv => inv.childName === 'Sarah Johnson').map((invoice) => (
            <Card key={invoice.id} className="academic-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{invoice.id}</CardTitle>
                    <CardDescription>{invoice.term}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{invoice.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-xl font-bold text-primary">${invoice.amount}</span>
                  </div>
                  {invoice.status === 'paid' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Paid Date:</span>
                      <span className="font-medium text-academic-success">{invoice.paidDate}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <ModularButton 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleViewDetails(invoice)}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </ModularButton>
                    {invoice.status === 'paid' ? (
                      <ModularButton variant="outline" className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Download Receipt
                      </ModularButton>
                    ) : (
                      <ModularButton 
                        className="flex-1 gap-2"
                        onClick={() => handlePayNow(invoice)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </ModularButton>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="michael" className="space-y-4">
          {invoices.filter(inv => inv.childName === 'Michael Johnson').map((invoice) => (
            <Card key={invoice.id} className="academic-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{invoice.id}</CardTitle>
                    <CardDescription>{invoice.term}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{invoice.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-xl font-bold text-primary">${invoice.amount}</span>
                  </div>
                  {invoice.status === 'paid' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Paid Date:</span>
                      <span className="font-medium text-academic-success">{invoice.paidDate}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <ModularButton 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleViewDetails(invoice)}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </ModularButton>
                    {invoice.status === 'paid' ? (
                      <ModularButton variant="outline" className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Download Receipt
                      </ModularButton>
                    ) : (
                      <ModularButton 
                        className="flex-1 gap-2"
                        onClick={() => handlePayNow(invoice)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </ModularButton>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Payment QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md academic-card">
          <DialogHeader>
            <DialogTitle>Scan to Pay</DialogTitle>
            <DialogDescription>
              {selectedInvoice ? `Payment for ${selectedInvoice.id} - $${selectedInvoice.amount}` : 'Scan the QR code to complete payment'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <img src={paymentQR} alt="Payment QR Code" className="w-full max-w-sm rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={!!selectedInvoice && !showQR} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-lg academic-card">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="space-y-2">
                {selectedInvoice.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.description}</span>
                    <span className="font-medium">${item.amount}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${selectedInvoice.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeePayments;