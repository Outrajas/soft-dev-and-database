import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    label: string;
  };
  glow?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  glow = false,
  className
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          icon: 'text-academic-success',
          iconBg: 'bg-academic-success/15',
          value: 'text-academic-success',
          glow: 'shadow-[0_0_20px_hsl(var(--academic-success)/0.3)]'
        };
      case 'warning':
        return {
          icon: 'text-academic-warning',
          iconBg: 'bg-academic-warning/15',
          value: 'text-academic-warning',
          glow: 'shadow-[0_0_20px_hsl(var(--academic-warning)/0.3)]'
        };
      case 'error':
        return {
          icon: 'text-academic-error',
          iconBg: 'bg-academic-error/15',
          value: 'text-academic-error',
          glow: 'shadow-[0_0_20px_hsl(var(--academic-error)/0.3)]'
        };
      default:
        return {
          icon: 'text-primary',
          iconBg: 'bg-primary/15',
          value: 'text-primary',
          glow: 'shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Card className={cn(
      'academic-card group hover:scale-105 transition-all duration-300',
      glow && colors.glow,
      className
    )}>
      <CardContent className="flex items-center p-6">
        <div className="flex items-center space-x-4 w-full">
          <div className={cn(
            'p-3 rounded-xl transition-all duration-300 group-hover:scale-110',
            colors.iconBg
          )}>
            <Icon className={cn('h-6 w-6', colors.icon)} />
          </div>
          <div className="flex-1">
            <p className={cn(
              'text-3xl font-bold mb-1 transition-all duration-300',
              colors.value
            )}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {title}
            </p>
            {trend && (
              <div className="flex items-center mt-2">
                <span className={cn(
                  'text-xs font-medium',
                  trend.value > 0 ? 'text-academic-success' : 'text-academic-error'
                )}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;