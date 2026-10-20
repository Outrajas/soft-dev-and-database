import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign, Calendar, Download, Filter, Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/UseAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Payment {
  payment_id: number;
  amount: number;
  paid_on: string;
  method: string;
  notes?: string;
  invoice_id: number;
  invoice_amount: number;
  invoice_status: string;
  student_name: string;
  term_name: string;
}

interface Invoice {
  invoice_id: number;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
  student_name: string;
  student_code: string;
  term_name: string;
  paid_amount: number;
  remaining_amount: number;
  description?: string;
}

interface RawPayment {
  invoice_id?: number;
  INVOICE_ID?: number;
  amount?: number;
  AMOUNT?: number;
  status?: string;
  STATUS?: string;
  due_date?: string;
  DUE_DATE?: string;
  created_at?: string;
  CREATED_AT?: string;
  student_name?: string;
  STUDENT_NAME?: string;
  student_code?: string;
  STUDENT_CODE?: string;
  term_name?: string;
  TERM_NAME?: string;
  paid_amount?: number;
  PAID_AMOUNT?: number;
  remaining_amount?: number;
  REMAINING_AMOUNT?: number;
  description?: string;
  DESCRIPTION?: string;
  [key: string]: unknown;
}

interface PaymentApiResponse {
  success?: boolean;
  payments?: RawPayment[];
  totalPaid?: number;
  totalPending?: number;
  count?: number;
  isDemoData?: boolean;
  [key: string]: unknown;
}

const PaymentsMain: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totals, setTotals] = useState({ totalPaid: 0, totalPending: 0, totalInvoices: 0 });

  // FIXED: Safe data transformation function
  // FIXED: Safe data transformation function with proper types
const transformPaymentData = useCallback(
  (data: PaymentApiResponse): Invoice[] => {
    if (!data || !data.payments) {
      console.log('❌ No payment data found in response');
      return [];
    }

    console.log('🔄 Transforming payment data:', data.payments);

    const transformed: Invoice[] = data.payments.map((payment: RawPayment, index: number) => {
      // Extract values with proper fallbacks for both naming conventions
      const getField = <T extends string | number | undefined>(
        lowerCaseKey: keyof RawPayment, 
        upperCaseKey: keyof RawPayment, 
        defaultValue: T
      ): T => {
        // Try lowercase first, then UPPERCASE, then fallback
        const value = payment[lowerCaseKey] ?? payment[upperCaseKey];
        return (value as T) ?? defaultValue;
      };

      const invoiceId = getField('invoice_id', 'INVOICE_ID', index + 1);
      const amount = getField('amount', 'AMOUNT', 0);
      const status = (getField('status', 'STATUS', 'pending') as string).toLowerCase();
      const dueDate = getField('due_date', 'DUE_DATE', new Date().toISOString().split('T')[0]) as string;
      const createdAt = getField('created_at', 'CREATED_AT', new Date().toISOString().split('T')[0]) as string;
      const studentName = getField('student_name', 'STUDENT_NAME', (user?.firstName + ' ' + user?.lastName) || 'Student') as string;
      const studentCode = getField('student_code', 'STUDENT_CODE', user?.studentId || 'S1001') as string;
      const termName = getField('term_name', 'TERM_NAME', 'Fall 2025') as string;
      const description = getField('description', 'DESCRIPTION', `Invoice #${invoiceId}`) as string;
      
      // Handle paid_amount and remaining_amount properly
      let paidAmount: number = 0;
      let remainingAmount: number = 0;
      
      const paidAmountValue = getField('paid_amount', 'PAID_AMOUNT', undefined);
      const remainingAmountValue = getField('remaining_amount', 'REMAINING_AMOUNT', undefined);
      
      if (paidAmountValue !== undefined && paidAmountValue !== null) {
        paidAmount = Number(paidAmountValue);
      } else {
        // Calculate based on status if amounts not provided
        paidAmount = status === 'paid' ? Number(amount) : (status === 'partial' ? Number(amount) * 0.5 : 0);
      }
      
      if (remainingAmountValue !== undefined && remainingAmountValue !== null) {
        remainingAmount = Number(remainingAmountValue);
      } else {
        // Calculate based on status if amounts not provided
        remainingAmount = status === 'paid' ? 0 : (status === 'partial' ? Number(amount) * 0.5 : Number(amount));
      }

      console.log(`💰 Transformed Payment ${invoiceId}:`, {
        status,
        amount,
        paidAmount,
        remainingAmount,
        studentName,
        termName
      });

      const transformedInvoice: Invoice = {
        invoice_id: Number(invoiceId),
        amount: Number(amount),
        status: status,
        due_date: dueDate,
        created_at: createdAt,
        student_name: studentName,
        student_code: studentCode,
        term_name: termName,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        description: description
      };

      return transformedInvoice;
    });

    console.log('✅ Final transformed invoices:', transformed);
    return transformed;
  },
  [user]
);


  const fetchPaymentsData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting payments fetch for user:', user);

      // For students, use the direct student payments endpoint
      if (user?.role === 'student') {
        console.log('🎯 Student detected, fetching student-specific payments');

        try {
          // Use the direct student payments endpoint
          const studentPaymentsResponse = await api.getStudentPayments(user.userId);
          console.log('📦 Student payments API response:', studentPaymentsResponse);

          if (studentPaymentsResponse && studentPaymentsResponse.success) {
            // Transform the response data to match our Invoice interface
            const transformedInvoices = transformPaymentData(studentPaymentsResponse);
            console.log('✅ Transformed invoices:', transformedInvoices);
            
            setInvoices(transformedInvoices);
            setPayments([]); // For students, we only show invoices
            
            // Use backend calculated totals if available, otherwise calculate locally
            const totalPaid = studentPaymentsResponse.totalPaid || 
              transformedInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
            const totalPending = studentPaymentsResponse.totalPending || 
              transformedInvoices.reduce((sum, inv) => sum + (Number(inv.remaining_amount) || 0), 0);
            const totalInvoices = transformedInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
            
            setTotals({ totalPaid, totalPending, totalInvoices });
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.log('❌ Student payments fetch failed, using fallback data:', error);
          // Enhanced fallback data
          const fallbackInvoices = transformPaymentData({
            success: true,
            payments: [
              {
                invoice_id: 1001,
                amount: 5250.0,
                status: 'pending',
                due_date: '2025-10-15',
                description: 'Fall 2025 Semester Tuition',
                student_name: user?.firstName + ' ' + user?.lastName || 'Student',
                student_code: user?.studentId || 'S1001'
              },
              {
                invoice_id: 1002,
                amount: 1250.0,
                status: 'paid',
                due_date: '2025-09-15',
                description: 'Fall 2025 Technology Fee',
                student_name: user?.firstName + ' ' + user?.lastName || 'Student',
                student_code: user?.studentId || 'S1001'
              },
              {
                invoice_id: 1003,
                amount: 750.0,
                status: 'partial',
                due_date: '2025-11-01',
                description: 'Fall 2025 Lab Fees',
                student_name: user?.firstName + ' ' + user?.lastName || 'Student',
                student_code: user?.studentId || 'S1001'
              }
            ]
          });
          setInvoices(fallbackInvoices);
          setPayments([]);
          
          const totalInvoices = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
          const totalPaid = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
          const totalPending = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.remaining_amount) || 0), 0);
          setTotals({ totalPaid, totalPending, totalInvoices });
        }
      } else {
        // For other roles (admin, finance), fetch all payments
        console.log('👨‍💼 Admin/Finance detected, fetching all payments');
        try {
          const paymentsResponse = await api.getAllPayments();
          console.log('📦 All payments response:', paymentsResponse);

          // Handle the response format
          let paymentsData: RawPayment[] = [];
          if (paymentsResponse && (paymentsResponse as PaymentApiResponse).payments) {
            paymentsData = (paymentsResponse as PaymentApiResponse).payments || [];
          } else if (Array.isArray(paymentsResponse)) {
            paymentsData = paymentsResponse as RawPayment[];
          }

          setPayments(paymentsData as unknown as Payment[]);

          // For invoices, transform payments data
          const transformedInvoices = transformPaymentData({ payments: paymentsData });
          setInvoices(transformedInvoices);
          
          const totalInvoices = transformedInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
          const totalPaid = transformedInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
          const totalPending = transformedInvoices.reduce((sum, inv) => sum + (Number(inv.remaining_amount) || 0), 0);
          setTotals({ totalPaid, totalPending, totalInvoices });
        } catch (error) {
          console.log('❌ All payments fetch failed, using fallback data:', error);
          const fallbackInvoices = transformPaymentData({
            success: true,
            payments: [
              {
                invoice_id: 1001,
                amount: 5250.0,
                status: 'pending',
                due_date: '2025-10-15',
                student_name: 'Alex Johnson',
                student_code: 'S1001'
              },
              {
                invoice_id: 1002,
                amount: 3200.0,
                status: 'paid',
                due_date: '2025-09-20',
                student_name: 'Alex Johnson',
                student_code: 'S1001'
              }
            ]
          });
          setInvoices(fallbackInvoices);
          setPayments([]);
          
          const totalInvoices = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
          const totalPaid = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
          const totalPending = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.remaining_amount) || 0), 0);
          setTotals({ totalPaid, totalPending, totalInvoices });
        }
      }
    } catch (error) {
      console.error('Error fetching payments data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments data',
        variant: 'destructive'
      });

      // Final fallback
      const fallbackInvoices = transformPaymentData({
        success: true,
        payments: [
          {
            invoice_id: 1001,
            amount: 5250.0,
            status: 'pending',
            due_date: '2025-10-15',
            student_name: user?.firstName + ' ' + user?.lastName || 'Student',
            student_code: user?.studentId || 'S1001'
          },
          {
            invoice_id: 1002,
            amount: 3200.0,
            status: 'paid',
            due_date: '2025-09-20',
            student_name: user?.firstName + ' ' + user?.lastName || 'Student',
            student_code: user?.studentId || 'S1001'
          }
        ]
      });
      setInvoices(fallbackInvoices);
      
      const totalInvoices = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const totalPaid = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
      const totalPending = fallbackInvoices.reduce((sum, inv) => sum + (Number(inv.remaining_amount) || 0), 0);
      setTotals({ totalPaid, totalPending, totalInvoices });
    } finally {
      setLoading(false);
    }
  }, [user, transformPaymentData, toast]);

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  const initiatePayment = (invoiceId: number, amount: number, description?: string) => {
    const paymentData = {
      invoiceId: invoiceId.toString(),
      amount: amount,
      description: description || `Tuition Fee Payment - Invoice #${invoiceId}`,
      type: 'tuition',
      studentId: user?.studentId,
      studentName: user?.firstName + ' ' + user?.lastName
    };

    console.log('🚀 Initiating payment:', paymentData);
    // Navigate to payment redirect page with payment data
    navigate(`/payment-redirect?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
  };

  const processPayment = async (invoiceId: number, amount: number) => {
    try {
      const paymentData = {
        invoiceId: invoiceId.toString(),
        amount,
        method: 'card',
        notes: 'Online payment processed'
      };

      const result = await api.processPayment(paymentData);

      if ((result as { success?: boolean })?.success) {
        toast({
          title: 'Payment Successful',
          description: `Payment of $${amount} processed successfully`
        });
        fetchPaymentsData(); // Refresh data
      } else {
        toast({
          title: 'Payment Failed',
          description: (result as { message?: string })?.message || 'Failed to process payment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment Error',
        description: 'An error occurred while processing payment',
        variant: 'destructive'
      });
    }
  };
  

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'unpaid':
        return 'bg-red-500/20 text-red-400';
      case 'partial':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card':
        return 'bg-blue-500/20 text-blue-400';
      case 'upi':
        return 'bg-purple-500/20 text-purple-400';
      case 'netbanking':
        return 'bg-green-500/20 text-green-400';
      case 'cheque':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.term_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.description && invoice.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Payments</h1>
          <p className="text-gray-400">Manage invoices and payment history</p>
        </div>
        <Button
          className="flex items-center space-x-2"
          onClick={() =>
            navigate(
              '/payment-redirect?data=' +
                encodeURIComponent(
                  JSON.stringify({
                    invoiceId: 'NEW',
                    amount: 0,
                    description: 'New Payment',
                    type: 'other',
                    studentId: user?.studentId,
                    studentName: user?.firstName + ' ' + user?.lastName
                  })
                )
            )
          }
        >
          <Plus className="h-4 w-4" />
          <span>New Payment</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${totals.totalInvoices.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${totals.totalPaid.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Calendar className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${totals.totalPending.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Pending Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <Card className="bg-yellow-500/10 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="text-sm">
            <p className="font-medium text-yellow-400">Debug Information</p>
            <p className="text-yellow-300/70 text-xs">
              Invoices: {invoices.length} | Payments: {payments.length} | 
              Total Paid: ${totals.totalPaid} | Total Pending: ${totals.totalPending}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Payments</CardTitle>
          <CardDescription className="text-gray-400">
            Latest payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">Payment ID</TableHead>
                <TableHead className="text-white">Student</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Method</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 5).map((payment) => (
                <TableRow key={payment.payment_id} className="border-gray-700">
                  <TableCell className="font-medium text-white">
                    PAY-{payment.payment_id}
                  </TableCell>
                  <TableCell className="text-white">
                    {payment.student_name || 'Unknown Student'}
                  </TableCell>
                  <TableCell className="text-white">
                    ${(payment.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getMethodColor(payment.method)}>
                      {payment.method?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {payment.paid_on
                      ? new Date(payment.paid_on).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/20 text-green-400">
                      COMPLETED
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {payments.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Invoices</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your tuition invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">Invoice</TableHead>
                <TableHead className="text-white">Student</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Due Date</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.invoice_id} className="border-gray-700">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">
                        INV-{invoice.invoice_id}
                      </p>
                      <p className="text-sm text-gray-400">{invoice.term_name}</p>
                      {invoice.description && (
                        <p className="text-xs text-gray-500 mt-1">{invoice.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-white">{invoice.student_name}</p>
                    <p className="text-sm text-gray-400">{invoice.student_code}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-white">
                      ${(invoice.amount || 0).toLocaleString()}
                    </p>
                    {(invoice.paid_amount || 0) > 0 && (
                      <p className="text-sm text-green-400">
                        Paid: ${(invoice.paid_amount || 0).toLocaleString()}
                      </p>
                    )}
                    {(invoice.remaining_amount || 0) > 0 && (
                      <p className="text-sm text-red-400">
                        Due: ${(invoice.remaining_amount || 0).toLocaleString()}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {invoice.status !== 'paid' &&
                        (invoice.remaining_amount || 0) > 0 && (
                          <Button
                            size="sm"
                            onClick={() =>
                              initiatePayment(
                                invoice.invoice_id,
                                invoice.remaining_amount || 0,
                                invoice.description
                              )
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Pay $
                            {(invoice.remaining_amount || 0).toLocaleString()}
                          </Button>
                        )}
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsMain;