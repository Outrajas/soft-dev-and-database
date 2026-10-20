import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/UseAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Eye, EyeOff, LogIn } from 'lucide-react';
import { api } from '@/lib/api';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'faculty', 'admin', 'finance', 'parent']),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onAccountExists?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onAccountExists }) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Use the API register method
      const result = await api.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
      });

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: result.message || "Your account has been created successfully!",
        });

        // Try to auto-login after successful registration
        try {
          const loginResult = await login(data.email, data.password);
          if (loginResult.success) {
            toast({
              title: "Welcome!",
              description: "You have been automatically signed in.",
            });
          } else {
            // If auto-login fails, prompt user to login manually
            toast({
              title: "Account Created",
              description: "Please sign in with your new credentials.",
            });
            if (onSwitchToLogin) {
              onSwitchToLogin();
            }
          }
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          // If auto-login fails, switch to login tab
          if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }

        // Reset form
        form.reset();
      } else {
        // Check if account already exists
        if (result.message?.toLowerCase().includes('already exists') || result.message?.toLowerCase().includes('email already')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          
          // Redirect to login page
          if (onAccountExists) {
            onAccountExists();
          } else if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        } else {
          toast({
            title: "Registration Failed",
            description: result.message || "Please check your information and try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="First name"
                      {...field}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      autoComplete="given-name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Last name"
                      {...field}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      autoComplete="family-name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    {...field}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="finance">Finance Officer</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Phone (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Phone number"
                    {...field}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    autoComplete="tel"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      {...field}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={isLoading}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      {...field}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <div className="text-center pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Already have an account?</p>
          <Button
            variant="outline"
            onClick={onSwitchToLogin}
            className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
            disabled={isLoading}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;