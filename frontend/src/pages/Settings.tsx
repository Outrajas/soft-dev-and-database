import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ModularButton from '@/components/ui/modular-button';
import { useAuth } from '@/hooks/UseAuth';
import { User, Bell, Shield, Palette, Mail, Phone, MapPin, Calendar, Loader2, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface UserSettings {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string; // FIXED: Made phone optional
  studentId?: string;
  facultyId?: string;
  programName?: string;
  departmentName?: string;
  admissionYear?: number;
  address: string;
  bio: string;
  role: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    gradeUpdates: true,
    courseAnnouncements: true,
    paymentReminders: true,
    systemUpdates: false,
  });
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    fontSize: 'medium',
    reduceMotion: false,
    highContrast: false
  });

  // Move mockUserSettings inside useMemo to prevent recreating on every render
  const mockUserSettings = useMemo((): UserSettings => ({
    email: user?.email || 'student@university.edu',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    studentId: user?.role === 'student' ? 'S2024001' : undefined,
    facultyId: user?.role === 'faculty' ? 'F2024001' : undefined,
    programName: 'BSc Computer Science',
    departmentName: 'Computer Science',
    admissionYear: 2024,
    address: '123 University Ave, Campus City, ST 12345',
    bio: 'Computer Science major with a passion for AI and machine learning.',
    role: user?.role || 'student'
  }), [user?.email, user?.role]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        // Try real API first, fallback to mock data
        if (user?.userId) {
          try {
            const settings = await api.getUserProfile(user.userId);
            const userSettingsData = settings || mockUserSettings;
            setUserSettings(userSettingsData);
            setFormData({
              firstName: userSettingsData.firstName,
              lastName: userSettingsData.lastName,
              email: userSettingsData.email,
              phone: userSettingsData.phone || '', // FIXED: Handle optional phone
              address: userSettingsData.address,
              bio: userSettingsData.bio
            });
          } catch (error) {
            console.log('Using mock user settings');
            setUserSettings(mockUserSettings);
            setFormData({
              firstName: mockUserSettings.firstName,
              lastName: mockUserSettings.lastName,
              email: mockUserSettings.email,
              phone: mockUserSettings.phone || '', // FIXED: Handle optional phone
              address: mockUserSettings.address,
              bio: mockUserSettings.bio
            });
          }
        } else {
          setUserSettings(mockUserSettings);
          setFormData({
            firstName: mockUserSettings.firstName,
            lastName: mockUserSettings.lastName,
            email: mockUserSettings.email,
            phone: mockUserSettings.phone || '', // FIXED: Handle optional phone
            address: mockUserSettings.address,
            bio: mockUserSettings.bio
          });
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        setUserSettings(mockUserSettings);
        setFormData({
          firstName: mockUserSettings.firstName,
          lastName: mockUserSettings.lastName,
          email: mockUserSettings.email,
          phone: mockUserSettings.phone || '', // FIXED: Handle optional phone
          address: mockUserSettings.address,
          bio: mockUserSettings.bio
        });
      }
    };

    fetchUserSettings();
  }, [user, mockUserSettings]); // Now mockUserSettings is stable and can be safely included

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (First Name, Last Name, Email).",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call with actual form data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state with new data
      const updatedSettings = {
        ...userSettings!,
        ...formData
      };
      setUserSettings(updatedSettings);
      
      toast({
        title: "✅ Profile updated successfully",
        description: "Your profile information has been saved.",
      });
      
      // Show success animation
      setTimeout(() => {
        setActiveTab('profile');
      }, 1000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "❌ Error updating profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with actual notification preferences
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "✅ Preferences saved successfully",
        description: "Your notification preferences have been updated.",
      });
      
      // Show which preferences were saved
      const enabledNotifications = Object.entries(notifications)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
        .join(', ');
        
      console.log('Saved notification preferences:', enabledNotifications);
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "❌ Error saving preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate password fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "🔒 Missing password fields",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "🔒 Password too short",
        description: "New password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "🔒 Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call with actual password data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear password fields on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: "✅ Password changed successfully",
        description: "Your password has been updated. Please log in again.",
      });
      
      // Show success and suggest logout
      setTimeout(() => {
        toast({
          title: "💡 Security Tip",
          description: "For security, consider logging out and logging back in.",
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "❌ Error changing password",
        description: "Please check your current password and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with actual appearance settings
      await new Promise(resolve => setTimeout(resolve, 600));
      
      toast({
        title: "🎨 Appearance saved successfully",
        description: `Theme: ${appearance.theme}, Font: ${appearance.fontSize}`,
      });
      
      // Apply theme immediately (in a real app, this would update CSS variables)
      console.log('Applied appearance settings:', appearance);
      
    } catch (error) {
      console.error('Error saving appearance:', error);
      toast({
        title: "❌ Error saving appearance",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPhoto = () => {
    toast({
      title: "📸 Upload Feature",
      description: "Photo upload functionality would be implemented here.",
    });
  };

  const handleEnable2FA = () => {
    toast({
      title: "🔐 Two-Factor Authentication",
      description: "2FA setup would be implemented here.",
    });
  };

  if (!userSettings) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Settings
        </h1>
        <p className="text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="profile" className="text-white data-[state=active]:bg-blue-600">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-blue-600">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-600">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-white data-[state=active]:bg-blue-600">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-gray-400">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24 border-2 border-gray-600">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <ModularButton 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-white hover:bg-gray-700"
                    onClick={handleUploadPhoto}
                    icon={Upload}
                  >
                    Upload Photo
                  </ModularButton>
                  <p className="text-sm text-gray-400">
                    JPG, PNG or GIF (max. 2MB)
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name *</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2 text-white">
                    <Mail className="h-4 w-4" />
                    <span>Email *</span>
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="your.email@university.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2 text-white">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-white">
                    {userSettings.role === 'student' ? 'Student ID' : 'Employee ID'}
                  </Label>
                  <Input 
                    id="studentId" 
                    value={userSettings.studentId || userSettings.facultyId || 'N/A'} 
                    disabled 
                    className="bg-gray-600 border-gray-500 text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program" className="text-white">
                    {userSettings.role === 'student' ? 'Program' : 'Department'}
                  </Label>
                  <Input 
                    id="program" 
                    value={userSettings.programName || userSettings.departmentName || 'N/A'} 
                    disabled 
                    className="bg-gray-600 border-gray-500 text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center space-x-2 text-white">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </Label>
                <Textarea 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={4}
                />
              </div>

              <div className="flex space-x-4">
                <ModularButton 
                  onClick={handleSaveProfile}
                  loading={isLoading}
                  glow
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  icon={CheckCircle}
                >
                  Save Profile Changes
                </ModularButton>
                <ModularButton 
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      firstName: userSettings.firstName,
                      lastName: userSettings.lastName,
                      email: userSettings.email,
                      phone: userSettings.phone || '', // FIXED: Handle optional phone
                      address: userSettings.address,
                      bio: userSettings.bio
                    });
                    toast({
                      title: "🔄 Changes reset",
                      description: "All changes have been reverted.",
                    });
                  }}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Reset
                </ModularButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-gray-400">Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-sm text-gray-400">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-white">Push Notifications</Label>
                    <p className="text-sm text-gray-400">Receive browser push notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>

                <div className="border-t border-gray-600 pt-4 space-y-4">
                  <h4 className="font-medium text-white">Notification Types</h4>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-white">Grade Updates</Label>
                      <p className="text-sm text-gray-400">When grades are posted</p>
                    </div>
                    <Switch 
                      checked={notifications.gradeUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, gradeUpdates: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-white">Course Announcements</Label>
                      <p className="text-sm text-gray-400">Updates from instructors</p>
                    </div>
                    <Switch 
                      checked={notifications.courseAnnouncements}
                      onCheckedChange={(checked) => setNotifications({...notifications, courseAnnouncements: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-white">Payment Reminders</Label>
                      <p className="text-sm text-gray-400">Upcoming payment due dates</p>
                    </div>
                    <Switch 
                      checked={notifications.paymentReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, paymentReminders: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-white">System Updates</Label>
                      <p className="text-sm text-gray-400">Platform maintenance and updates</p>
                    </div>
                    <Switch 
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})}
                    />
                  </div>
                </div>
              </div>

              <ModularButton 
                onClick={handleSavePreferences} 
                loading={isLoading} 
                glow
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                icon={CheckCircle}
              >
                Save Notification Preferences
              </ModularButton>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription className="text-gray-400">Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white">Current Password *</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">New Password *</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm New Password *</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>

              <ModularButton 
                onClick={handleChangePassword}
                loading={isLoading}
                glow
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                icon={Shield}
              >
                Update Password
              </ModularButton>

              <div className="border-t border-gray-600 pt-6 space-y-4">
                <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">
                  Add an extra layer of security to your account
                </p>
                <ModularButton 
                  variant="outline" 
                  className="border-gray-600 text-white hover:bg-gray-700 w-full"
                  onClick={handleEnable2FA}
                  icon={CheckCircle}
                >
                  Enable Two-Factor Authentication
                </ModularButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Appearance</CardTitle>
              <CardDescription className="text-gray-400">Customize how the platform looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'dark', name: 'Dark', bg: 'from-gray-800 to-gray-900', border: 'border-gray-600' },
                      { id: 'light', name: 'Light', bg: 'from-gray-100 to-gray-300', border: 'border-gray-400' },
                      { id: 'auto', name: 'Auto', bg: 'from-gray-800 via-gray-100 to-gray-900', border: 'border-gray-400' }
                    ].map((theme) => (
                      <div 
                        key={theme.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          appearance.theme === theme.id 
                            ? 'border-blue-500 bg-gray-700' 
                            : `border-gray-600 hover:border-blue-500 ${theme.id === 'light' ? 'bg-gray-700' : 'bg-gray-700'}`
                        }`}
                        onClick={() => setAppearance(prev => ({ ...prev, theme: theme.id }))}
                      >
                        <div className="text-center">
                          <div className={`h-20 bg-gradient-to-br ${theme.bg} rounded mb-2 border ${theme.border}`} />
                          <p className="text-sm font-medium text-white">{theme.name}</p>
                          {appearance.theme === theme.id && (
                            <CheckCircle className="h-4 w-4 text-blue-500 mx-auto mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Font Size</Label>
                  <select 
                    value={appearance.fontSize}
                    onChange={(e) => setAppearance(prev => ({ ...prev, fontSize: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small" className="bg-gray-800">Small</option>
                    <option value="medium" className="bg-gray-800">Medium</option>
                    <option value="large" className="bg-gray-800">Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-white">Reduce Motion</Label>
                    <p className="text-sm text-gray-400">Minimize animations and transitions</p>
                  </div>
                  <Switch 
                    checked={appearance.reduceMotion}
                    onCheckedChange={(checked) => setAppearance(prev => ({ ...prev, reduceMotion: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-white">High Contrast</Label>
                    <p className="text-sm text-gray-400">Increase visual contrast for better readability</p>
                  </div>
                  <Switch 
                    checked={appearance.highContrast}
                    onCheckedChange={(checked) => setAppearance(prev => ({ ...prev, highContrast: checked }))}
                  />
                </div>
              </div>

              <ModularButton 
                onClick={handleSaveAppearance} 
                loading={isLoading} 
                glow
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                icon={Palette}
              >
                Save Appearance Settings
              </ModularButton>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;