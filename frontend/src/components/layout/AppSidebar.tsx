import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent,
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  Calendar, 
  Bell, 
  Settings,
  Users,
  BarChart3,
  FileText,
  Building,
  Wallet,
  Clock,
  X,
  School,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/UseAuth';

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
  permission: string;
  roles?: string[];
}

const AppSidebar: React.FC<AppSidebarProps> = ({ open, onOpenChange }) => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', permission: 'view_dashboard' },
      { icon: Bell, label: 'Notifications', href: '/notifications', permission: 'view_notifications' },
      { icon: Settings, label: 'Settings', href: '/settings', permission: 'view_profile' },
    ];

    const roleSpecificItems: NavItem[] = [
      // Student items
      { icon: BookOpen, label: 'My Courses', href: '/courses', permission: 'view_courses', roles: ['student'] },
      { icon: GraduationCap, label: 'My Grades', href: '/grades', permission: 'view_grades', roles: ['student'] },
      { icon: Calendar, label: 'My Attendance', href: '/attendance', permission: 'view_attendance', roles: ['student'] },
      { icon: CreditCard, label: 'My Payments', href: '/payments', permission: 'make_payments', roles: ['student'] },
      
      // Faculty items - FIXED: Changed 'view_classes' to 'manage_classes'
      { icon: School, label: 'My Classes', href: '/classes', permission: 'manage_classes', roles: ['faculty'] },
      { icon: UserCheck, label: 'Grade Management', href: '/grade-management', permission: 'manage_grades', roles: ['faculty'] },
      { icon: Clock, label: 'Attendance Tracking', href: '/attendance-tracking', permission: 'track_attendance', roles: ['faculty'] },
      { icon: Calendar, label: 'My Schedule', href: '/schedule', permission: 'view_schedule', roles: ['faculty'] },
      
      // Admin items
      { icon: Users, label: 'User Management', href: '/users', permission: 'manage_users', roles: ['admin'] },
      { icon: BookOpen, label: 'Course Management', href: '/course-management', permission: 'manage_courses', roles: ['admin'] },
      { icon: Building, label: 'Department Management', href: '/departments', permission: 'manage_departments', roles: ['admin'] },
      { icon: BarChart3, label: 'Reports & Analytics', href: '/reports', permission: 'view_reports', roles: ['admin'] },
      
      // Finance items
      { icon: FileText, label: 'Invoice Management', href: '/invoices', permission: 'manage_invoices', roles: ['finance'] },
      { icon: CreditCard, label: 'Payment Tracking', href: '/payment-tracking', permission: 'track_payments', roles: ['finance'] },
      { icon: BarChart3, label: 'Financial Reports', href: '/financial-reports', permission: 'view_financial_reports', roles: ['finance'] },
      
      // Parent items
      { icon: Users, label: 'My Children', href: '/children', permission: 'view_children', roles: ['parent'] },
      { icon: BarChart3, label: 'Academic Progress', href: '/progress', permission: 'view_progress', roles: ['parent'] },
      { icon: Wallet, label: 'Fee Payments', href: '/fee-payments', permission: 'make_payments', roles: ['parent'] },
    ];

    return [...commonItems, ...roleSpecificItems].filter(item => {
      const hasRoleAccess = !item.roles || (user?.role && item.roles.includes(user.role));
      const hasPermissionAccess = hasPermission(item.permission);
      return hasRoleAccess && hasPermissionAccess;
    });
  };

  const navItems = getNavItems();

  // Debug logging to verify My Classes appears
  React.useEffect(() => {
    console.log('🔍 Sidebar Debug:', {
      userRole: user?.role,
      userPermissions: user?.permissions,
      hasManageClasses: hasPermission('manage_classes'),
      myClassesItem: navItems.find(item => item.href === '/classes'),
      allNavItems: navItems.map(item => ({ label: item.label, href: item.href }))
    });
  }, [navItems, user, hasPermission]);

  const sidebarContent = (
    <div className="w-80 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <img 
            src="/favicon.ico" 
            alt="University Logo" 
            className="w-8 h-8"
          />
          <div>
            <h1 className="text-white font-bold text-lg">EduPortal</h1>
            <p className="text-gray-400 text-xs capitalize">{user?.role} Portal</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="lg:hidden text-white hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => onOpenChange(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Info Footer */}
      <div className="p-6 border-t border-gray-800 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.firstName || user?.email?.split('@')[0]}
            </p>
            <p className="text-gray-400 text-xs capitalize truncate">
              {user?.role} Account
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left">
          <div className="p-0 bg-gray-900 border-r border-gray-800 w-80 h-full">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        {sidebarContent}
      </div>
    </>
  );
};

export default AppSidebar;