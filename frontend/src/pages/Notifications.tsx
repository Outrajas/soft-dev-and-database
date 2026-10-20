import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from "@/hooks/UseAuth";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  CreditCard, 
  BookOpen, 
  Users, 
  Calendar,
  Clock,
  Eye,
  Trash2,
  Settings,
  Loader2
} from 'lucide-react';
import ModularButton from '@/components/ui/modular-button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  notification_id: number;
  type: string;
  content: string;
  created_at: string;
  read_at: string | null;
  user_email: string;
}

interface BackendNotification {
  notification_id?: number;
  NOTIFICATION_ID?: number;
  type?: string;
  TYPE?: string;
  content?: string;
  CONTENT?: string;
  created_at?: string;
  CREATED_AT?: string;
  read_at?: string | null;
  READ_AT?: string | null;
  user_email?: string;
  USER_EMAIL?: string;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  const getDemoNotifications = useCallback((): Notification[] => [
    {
      notification_id: 1,
      type: 'system',
      content: 'Welcome to EduPortal! Your account has been activated successfully.',
      created_at: new Date().toISOString(),
      read_at: null,
      user_email: user?.email || 'student@university.edu'
    },
    {
      notification_id: 2,
      type: 'academic',
      content: 'New grade has been posted for CS101 - Introduction to Computer Science',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read_at: null,
      user_email: user?.email || 'student@university.edu'
    },
    {
      notification_id: 3,
      type: 'payment',
      content: 'Tuition fee payment of $1,250.00 is due in 7 days',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date().toISOString(),
      user_email: user?.email || 'student@university.edu'
    },
    {
      notification_id: 4,
      type: 'warning',
      content: 'Low attendance warning: Your attendance in MATH201 is below 75%',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: null,
      user_email: user?.email || 'student@university.edu'
    }
  ], [user?.email]);

  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'academic': return BookOpen;
      case 'payment': return CreditCard;
      case 'system': return Settings;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  }, []);

  const getNotificationColor = useCallback((type: string) => {
    switch (type) {
      case 'academic': return 'text-blue-400';
      case 'payment': return 'text-green-400';
      case 'system': return 'text-gray-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  }, []);

  const getNotificationBgColor = useCallback((type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-400/20';
      case 'payment': return 'bg-green-400/20';
      case 'system': return 'bg-gray-400/20';
      case 'warning': return 'bg-yellow-400/20';
      default: return 'bg-blue-400/20';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (user?.userId) {
        try {
          const response = await api.getNotifications(user.userId);
          // FIXED: Remove .notifications and .data access
          const notificationsData = Array.isArray(response) ? response : [];
          
          if (notificationsData.length > 0) {
            const transformedNotifications = notificationsData.map((notif: BackendNotification) => ({
              notification_id: notif.notification_id ?? notif.NOTIFICATION_ID ?? Math.random(),
              type: (notif.type?.toLowerCase() ?? notif.TYPE?.toLowerCase() ?? 'system'),
              content: notif.content ?? notif.CONTENT ?? 'No content available',
              created_at: notif.created_at ?? notif.CREATED_AT ?? new Date().toISOString(),
              read_at: notif.read_at ?? notif.READ_AT ?? null,
              user_email: notif.user_email ?? notif.USER_EMAIL ?? user?.email ?? ''
            }));
            setNotifications(transformedNotifications);
          } else {
            // Fallback to demo notifications
            setNotifications(getDemoNotifications());
          }
        } catch (error) {
          console.log('Using fallback notifications data');
          setNotifications(getDemoNotifications());
        }
      } else {
        setNotifications(getDemoNotifications());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(getDemoNotifications());
    } finally {
      setIsLoading(false);
    }
  }, [getDemoNotifications, user?.email, user?.userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    setActionLoading(notificationId);
    try {
      await api.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.notification_id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(prev => 
        prev.map(notif => 
          notif.notification_id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    setActionLoading(notificationId);
    try {
      await api.deleteNotification(notificationId);
      
      setNotifications(prev => prev.filter(notif => notif.notification_id !== notificationId));
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotifications(prev => prev.filter(notif => notif.notification_id !== notificationId));
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    setActionLoading(-1);
    try {
      if (user?.userId) {
        await api.markAllNotificationsAsRead(user.userId);
      }
      
      setNotifications(prev => prev.map(notif => ({ 
        ...notif, 
        read_at: notif.read_at || new Date().toISOString() 
      })));
      toast({
        title: "All notifications marked as read",
        description: `${notifications.filter(n => !n.read_at).length} notifications updated`,
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(prev => prev.map(notif => ({ 
        ...notif, 
        read_at: notif.read_at || new Date().toISOString() 
      })));
      toast({
        title: "All notifications marked as read",
        description: `${notifications.filter(n => !n.read_at).length} notifications updated`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;
  const unreadNotifications = notifications.filter(n => !n.read_at);
  const readNotifications = notifications.filter(n => n.read_at);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Bell className="h-8 w-8 text-blue-400" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 animate-pulse">
                {unreadCount} New
              </Badge>
            )}
          </h1>
          <p className="text-gray-400">
            Stay updated with your academic progress and important announcements
          </p>
        </div>
        <div className="space-x-2">
          <ModularButton 
            variant="outline" 
            icon={Eye}
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || actionLoading === -1}
            loading={actionLoading === -1}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Mark All Read
          </ModularButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Bell className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{notifications.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{unreadCount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">
                  {notifications.filter(n => n.type === 'warning').length}
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Important</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{readNotifications.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Read</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
          <TabsTrigger value="all" className="text-white data-[state=active]:bg-blue-600">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread" className="text-white data-[state=active]:bg-blue-600">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read" className="text-white data-[state=active]:bg-blue-600">Read ({readNotifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Notifications</h3>
                <p className="text-gray-400">You're all caught up! Check back later for updates.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <Card key={notification.notification_id} className={`bg-gray-800 border-gray-700 transition-all duration-300 ${
                  !notification.read_at ? 'border-blue-500/30 bg-blue-500/10' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getNotificationBgColor(notification.type)}`}>
                        <IconComponent className={`h-6 w-6 ${getNotificationColor(notification.type)}`} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification
                            </h3>
                            {!notification.read_at && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getNotificationBgColor(notification.type)} ${getNotificationColor(notification.type)} border-0`}>
                              {notification.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300">{notification.content}</p>
                        <div className="flex items-center space-x-2 pt-2">
                          {!notification.read_at && (
                            <ModularButton
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.notification_id)}
                              disabled={actionLoading === notification.notification_id}
                              loading={actionLoading === notification.notification_id}
                              className="border-gray-600 text-white hover:bg-gray-700"
                            >
                              Mark as Read
                            </ModularButton>
                          )}
                          <ModularButton
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.notification_id)}
                            disabled={actionLoading === notification.notification_id}
                            loading={actionLoading === notification.notification_id}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ModularButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
                <p className="text-gray-400">You have no unread notifications.</p>
              </CardContent>
            </Card>
          ) : (
            unreadNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <Card key={notification.notification_id} className="bg-gray-800 border-blue-500/30 bg-blue-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getNotificationBgColor(notification.type)}`}>
                        <IconComponent className={`h-6 w-6 ${getNotificationColor(notification.type)}`} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification
                            </h3>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getNotificationBgColor(notification.type)} ${getNotificationColor(notification.type)} border-0`}>
                              {notification.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300">{notification.content}</p>
                        <div className="flex items-center space-x-2 pt-2">
                          <ModularButton
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.notification_id)}
                            disabled={actionLoading === notification.notification_id}
                            loading={actionLoading === notification.notification_id}
                            className="border-gray-600 text-white hover:bg-gray-700"
                          >
                            Mark as Read
                          </ModularButton>
                          <ModularButton
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.notification_id)}
                            disabled={actionLoading === notification.notification_id}
                            loading={actionLoading === notification.notification_id}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ModularButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {readNotifications.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <Info className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Read Notifications</h3>
                <p className="text-gray-400">You haven't read any notifications yet.</p>
              </CardContent>
            </Card>
          ) : (
            readNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <Card key={notification.notification_id} className="bg-gray-800 border-gray-700 opacity-75 hover:opacity-100 transition-opacity">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getNotificationBgColor(notification.type)}`}>
                        <IconComponent className={`h-6 w-6 ${getNotificationColor(notification.type)}`} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getNotificationBgColor(notification.type)} ${getNotificationColor(notification.type)} border-0`}>
                              {notification.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300">{notification.content}</p>
                        <div className="flex items-center space-x-2 pt-2">
                          <ModularButton
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.notification_id)}
                            disabled={actionLoading === notification.notification_id}
                            loading={actionLoading === notification.notification_id}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ModularButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;