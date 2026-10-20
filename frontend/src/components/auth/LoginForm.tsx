import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/UseAuth';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    const handleDemoAutoFill = (event: CustomEvent) => {
      const { email, password } = event.detail;
      setFormData({ email, password });
      console.log('📥 Auto-filled demo credentials:', { email });
    };

    window.addEventListener('demoAutoFill', handleDemoAutoFill as EventListener);
    
    return () => {
      window.removeEventListener('demoAutoFill', handleDemoAutoFill as EventListener);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Form submission started:', { email: formData.email });
      
      if (!formData.email || !formData.password) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: result.message,
        });
      } else {
        toast({
          title: "Login failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Login form error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-xl">Sign In to Your Account</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your credentials to access the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                disabled={isLoading}
                autoComplete="current-password" // FIXED: Added autocomplete attribute
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <h4 className="text-sm font-medium text-white mb-2">Demo Account Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Use the demo buttons on the left for instant access</p>
            <p>• Credentials will be auto-filled automatically</p>
            <p>• No need to type anything manually</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
              onClick={() => window.dispatchEvent(new CustomEvent('switchToRegister'))}
            >
              Create one here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;