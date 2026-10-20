import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModularButton from '@/components/ui/modular-button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import paymentQR from '@/assets/payment-qr.jpg';

const PaymentTracking: React.FC = () => {
  const [showQR, setShowQR] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const payments = [
    { id: 'PAY-2024-001', student: 'John Smith', amount: 3500, method: 'UPI', status: 'completed', date: '2024-12-01', invoice: 'INV-2024-001' },
    { id: 'PAY-2024-002', student: 'Emma Wilson', amount: 3200, method: 'Card', status: 'completed', date: '2024-12-01', invoice: 'INV-2024-002' },
    { id: 'PAY-2024-003', student: 'Michael Brown', amount: 3500, method: 'UPI', status: 'pending', date: '2024-12-02', invoice: 'INV-2024-003' },
    { id: 'PAY-2024-004', student: 'Sarah Davis', amount: 3200, method: 'Bank Transfer', status: 'processing', date: '2024-12-02', invoice: 'INV-2024-004' },
    { id: 'PAY-2024-005', student: 'James Johnson', amount: 3500, method: 'Cash', status: 'completed', date: '2024-11-30', invoice: 'INV-2024-005' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-academic-success text-white';
      case 'processing': return 'bg-academic-warning text-white';
      case 'pending': return 'bg-primary text-white';
      case 'failed': return 'bg-destructive text-white';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Payment Tracking
          </h1>
          <p className="text-muted-foreground mt-2">Monitor and manage all payment transactions</p>
        </div>
        <ModularButton onClick={() => setShowQR(true)} className="gap-2">
          <DollarSign className="w-4 h-4" />
          Show Payment QR
        </ModularButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="academic-card border-academic-success/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-academic-success">$10,200</p>
              </div>
              <CheckCircle className="w-8 h-8 text-academic-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-academic-warning/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold text-academic-warning">$3,200</p>
              </div>
              <Clock className="w-8 h-8 text-academic-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-primary">$3,500</p>
              </div>
              <Clock className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="academic-card border-accent/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-accent">$16,900</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="academic-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{payment.id}</h3>
                      <Badge className={getStatusColor(payment.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          {payment.status.toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Student</p>
                        <p className="font-medium">{payment.student}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-bold text-primary">${payment.amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Method</p>
                        <p className="font-medium">{payment.method}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{payment.date}</p>
                      </div>
                    </div>
                  </div>
                  <ModularButton variant="outline" onClick={() => setSelectedPayment(payment)}>
                    <Eye className="w-4 h-4" />
                  </ModularButton>
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
            <DialogTitle>Payment QR Code</DialogTitle>
            <DialogDescription>Share this QR code for payments</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <img src={paymentQR} alt="Payment QR Code" className="w-full max-w-sm rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTracking;