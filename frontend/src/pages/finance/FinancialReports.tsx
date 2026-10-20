import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Download } from 'lucide-react';
import ModularButton from '@/components/ui/modular-button';

const FinancialReports: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Financial Reports
          </h1>
          <p className="text-muted-foreground mt-2">Comprehensive financial analytics and reports</p>
        </div>
        <ModularButton className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </ModularButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="academic-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Monthly Revenue</p><p className="text-3xl font-bold text-academic-success">$234K</p></div><DollarSign className="w-8 h-8 text-academic-success opacity-50" /></div></CardContent></Card>
        <Card className="academic-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Expenses</p><p className="text-3xl font-bold text-destructive">$89K</p></div><TrendingDown className="w-8 h-8 text-destructive opacity-50" /></div></CardContent></Card>
        <Card className="academic-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Net Profit</p><p className="text-3xl font-bold text-primary">$145K</p></div><TrendingUp className="w-8 h-8 text-primary opacity-50" /></div></CardContent></Card>
        <Card className="academic-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Growth</p><p className="text-3xl font-bold text-accent">+12%</p></div><TrendingUp className="w-8 h-8 text-accent opacity-50" /></div></CardContent></Card>
      </div>
    </div>
  );
};

export default FinancialReports;