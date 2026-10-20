import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ModularButtonProps {
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>['variant'] | 'academic';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  glow?: boolean;
  icon?: React.ComponentType<any>;
  className?: string;
}

const ModularButton: React.FC<ModularButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  onClick,
  disabled = false,
  loading = false,
  glow = false,
  icon: Icon,
  className = '',
}) => {
  const isDisabled = disabled || loading;
  const isAcademic = variant === 'academic';
  const buttonVariant = (isAcademic ? 'default' : variant) as React.ComponentProps<typeof Button>['variant'];
  const academicClass = isAcademic ? 'academic' : '';
  
  return (
    <Button
      variant={buttonVariant}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      className={`relative overflow-hidden transition-all duration-300 ${
        glow ? 'shadow-glow hover:shadow-glow-lg' : ''
      } ${academicClass} ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      
      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </div>
    </Button>
  );
};

export default ModularButton;