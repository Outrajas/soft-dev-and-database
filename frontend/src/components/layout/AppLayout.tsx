import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { Button } from '@/components/ui/button';
import { Menu, Bell, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/hooks/UseAuth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Black Navbar */}
        <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-gray-800 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Logo for mobile */}
              <div className="flex items-center space-x-2 lg:hidden">
                <img src="/favicon.ico" alt="Logo" className="w-6 h-6" />
                <span className="text-white font-bold text-sm">EduPortal</span>
              </div>
              
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 bg-gray-800 border-gray-700 text-white placeholder-gray-400 w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-gray-800 hover:text-white relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-gray-800 hover:text-white flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.email}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {user?.role} Account
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="cursor-pointer text-white hover:bg-gray-700">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-white hover:bg-gray-700">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-900">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;