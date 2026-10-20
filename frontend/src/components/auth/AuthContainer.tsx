import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, CreditCard, Shield, Star, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/UseAuth';
import { DEMO_ACCOUNTS } from '@/constants/demoAccounts';

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  facultyId?: string;
  department?: string;
  programName?: string;
  description: string;
}

const AuthContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    const fetchDemoAccounts = async () => {
      try {
        console.log("🔄 Fetching demo accounts from API...");
        const response = await api.getDemoAccounts();
        
        let accountsArray: DemoAccount[] = [];
        
        if (response && response.accounts && Array.isArray(response.accounts)) {
          accountsArray = response.accounts;
        } else if (Array.isArray(response)) {
          accountsArray = response;
        } else {
          console.log('📋 Using local demo accounts');
          accountsArray = DEMO_ACCOUNTS;
        }
        
        if (accountsArray.length > 0) {
          const validAccounts = accountsArray.filter(acc => 
            acc && acc.email && acc.password && acc.role
          );
          setDemoAccounts(validAccounts);
          console.log(`✅ Loaded ${validAccounts.length} demo accounts`);
        } else {
          setDemoAccounts(DEMO_ACCOUNTS);
        }
      } catch (error) {
        console.error('❌ Error fetching demo accounts, using local data:', error);
        setDemoAccounts(DEMO_ACCOUNTS);
      }
    };

    fetchDemoAccounts();
  }, []);

  // Handle switch to register event
  useEffect(() => {
    const handleSwitchToRegister = () => {
      setActiveTab('register');
    };

    window.addEventListener('switchToRegister', handleSwitchToRegister);
    
    return () => {
      window.removeEventListener('switchToRegister', handleSwitchToRegister);
    };
  }, []);

  const handleDemoLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🎯 Attempting demo login:', email);
      const result = await login(email, password);
      if (!result.success) {
        toast({
          title: "Demo login failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Demo login error:', error);
      toast({
        title: "Demo login error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAutoFill = async (email: string, password: string) => {
    console.log('📤 Dispatching demoAutoFill event:', { email });
    
    const event = new CustomEvent('demoAutoFill', { 
      detail: { email, password } 
    });
    window.dispatchEvent(event);
    
    setActiveTab('login');
    
    // Wait for form to update, then submit
    setTimeout(async () => {
      await handleDemoLogin(email, password);
    }, 100);
  };

  const handleAccountExists = () => {
    setActiveTab('login');
    toast({
      title: "Redirecting to Login",
      description: "Please sign in with your existing account.",
    });
  };

  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'student':
        return 'border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400';
      case 'faculty':
        return 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400';
      case 'admin':
        return 'border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400';
      case 'finance':
        return 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400';
      case 'parent':
        return 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400';
      default:
        return 'border-gray-500/50 text-gray-400 hover:bg-gray-500/10 hover:border-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-5 w-5" />;
      case 'faculty': return <Users className="h-5 w-5" />;
      case 'admin': return <Shield className="h-5 w-5" />;
      case 'finance': return <CreditCard className="h-5 w-5" />;
      case 'parent': return <Users className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student profiles, enrollment, and academic tracking"
    },
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Organize courses, assignments, and learning materials efficiently"
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Secure payment handling with real-time financial tracking"
    },
    {
      icon: Shield,
      title: "Role-based Access",
      description: "Secure access control for students, faculty, and administrators"
    },
    {
      icon: Star,
      title: "Analytics & Reports",
      description: "Detailed insights and reporting for informed decision making"
    },
    {
      icon: GraduationCap,
      title: "Academic Planning",
      description: "Curriculum management and academic progress tracking"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Hero & Features */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    EduPortal
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    Modern University Management System
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-gray-400 leading-relaxed">
                Streamline your educational institution with our comprehensive management platform. 
                Manage students, courses, payments, and academics all in one place.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Demo Accounts Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <span>Quick Demo Access</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Click any role below to auto-fill credentials and sign in instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {demoAccounts.length > 0 ? (
                    demoAccounts.map((account, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleDemoAutoFill(account.email, account.password)}
                        disabled={isLoading}
                        className={`h-auto py-3 px-2 flex flex-col items-center space-y-2 border-2 transition-all duration-300 ${getRoleStyles(account.role)}`}
                      >
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(account.role)}
                          <div className="text-center">
                            <div className="font-semibold text-sm capitalize">{account.role}</div>
                            <div className="text-xs opacity-75 mt-1">Auto Sign In</div>
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4 text-gray-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p>Loading demo accounts...</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-400 text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>How to use demo accounts:</span>
                  </div>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>• Click any role button above to auto-fill credentials</li>
                    <li>• Form will automatically submit and sign you in</li>
                    <li>• Each role has different permissions and features</li>
                    <li>• No manual typing required - fully automated</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Auth Forms */}
          <div className="space-y-8">
            <Card className="bg-gray-800 border-gray-700 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">
                  Get Started
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700 border-gray-600">
                    <TabsTrigger value="login" className="text-white data-[state=active]:bg-blue-600">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="text-white data-[state=active]:bg-blue-600">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <LoginForm />
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4 mt-6">
                    <RegisterForm 
                      onSwitchToLogin={() => setActiveTab('login')}
                      onAccountExists={handleAccountExists}
                    />
                  </TabsContent>
                </Tabs>

                <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-2 text-green-400 text-sm mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">Quick Access Tip</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Use the demo buttons on the left for instant access to all platform features. 
                    Credentials will be auto-filled and you'll be signed in automatically!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Platform Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Real-time Data</span>
                    <span className="text-green-400">✓ Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role-based Access</span>
                    <span className="text-green-400">✓ Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Integration</span>
                    <span className="text-green-400">✓ Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Processing</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-800 bg-gray-900 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-6 h-6 text-blue-400" />
              <span className="text-white font-bold">EduPortal</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 EduPortal University System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthContainer;