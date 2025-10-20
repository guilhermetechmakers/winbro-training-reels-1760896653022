/**
 * Admin Notifications Component
 * Real-time notifications and system monitoring for admin dashboard
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  RefreshCw,
  Filter,
  Clock,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// =====================================================
// Notification Types
// =====================================================

interface AdminNotification {
  id: string;
  type: 'system' | 'content' | 'user' | 'security' | 'billing';
  category: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'dismissed' | 'archived';
  action_required: boolean;
  action_url?: string;
  created_at: string;
  expires_at?: string;
}

interface AdminNotificationsProps {
  loading?: boolean;
  onRefresh?: () => void;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

// =====================================================
// Notification Item Component
// =====================================================

interface NotificationItemProps {
  notification: AdminNotification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDismiss }: NotificationItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'content':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'security':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'billing':
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
      notification.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-primary-text truncate">
                {notification.title}
              </h4>
              <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                {notification.priority}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-secondary-text flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimeAgo(notification.created_at)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(notification.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-secondary-text mt-1">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              {notification.action_required && (
                <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                  Action Required
                </Badge>
              )}
              {notification.action_url && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => window.open(notification.action_url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
            </div>
            
            {notification.status === 'unread' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-6 text-xs text-accent-blue hover:text-accent-blue/80"
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Main Admin Notifications Component
// =====================================================

export function AdminNotifications({ 
  loading = false, 
  onRefresh, 
  onMarkAsRead, 
  onDismiss 
}: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'high'>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockNotifications: AdminNotification[] = [
      {
        id: '1',
        type: 'system',
        category: 'infrastructure',
        title: 'High CPU Usage Detected',
        message: 'Server CPU usage has exceeded 80% for the last 15 minutes. Consider scaling resources.',
        priority: 'high',
        status: 'unread',
        action_required: true,
        action_url: '/admin/system/monitoring',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'content',
        category: 'moderation',
        title: 'Moderation Queue Full',
        message: '15 videos are pending approval in the moderation queue. Average wait time is 2 hours.',
        priority: 'medium',
        status: 'unread',
        action_required: true,
        action_url: '/admin/content',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'user',
        category: 'registration',
        title: 'New User Registration',
        message: '5 new users registered in the last hour from Acme Corp.',
        priority: 'low',
        status: 'read',
        action_required: false,
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'security',
        category: 'authentication',
        title: 'Failed Login Attempts',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100. Consider blocking this IP.',
        priority: 'high',
        status: 'unread',
        action_required: true,
        action_url: '/admin/security',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        type: 'billing',
        category: 'payment',
        title: 'Payment Failed',
        message: 'Payment failed for customer Acme Corp subscription. Retry scheduled for tomorrow.',
        priority: 'critical',
        status: 'unread',
        action_required: true,
        action_url: '/admin/billing',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: '6',
        type: 'system',
        category: 'maintenance',
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for tonight at 2 AM EST. Expected downtime: 30 minutes.',
        priority: 'medium',
        status: 'read',
        action_required: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, status: 'read' as const } : notif
      )
    );
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
    toast.success('Notification marked as read');
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, status: 'dismissed' as const } : notif
      )
    );
    if (onDismiss) {
      onDismiss(id);
    }
    toast.success('Notification dismissed');
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      toast.success('Notifications refreshed');
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (!showArchived && notif.status === 'archived') return false;
    
    switch (filter) {
      case 'unread':
        return notif.status === 'unread';
      case 'critical':
        return notif.priority === 'critical';
      case 'high':
        return notif.priority === 'high';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && n.status === 'unread').length;

  if (loading) {
    return (
      <Card className="card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-accent-blue" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-accent-blue" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        <CardDescription>
          System alerts and important updates
          {criticalCount > 0 && (
            <span className="text-red-600 font-medium ml-2">
              ({criticalCount} critical)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-secondary-text" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
              />
              <span>Show archived</span>
            </label>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-secondary-text">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDismiss={handleDismiss}
              />
            ))
          )}
        </div>

        {/* Quick Actions */}
        {unreadCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-text">
                {unreadCount} unread notifications
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNotifications(prev => 
                      prev.map(notif => ({ ...notif, status: 'read' as const }))
                    );
                    toast.success('All notifications marked as read');
                  }}
                >
                  Mark all as read
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNotifications(prev => 
                      prev.map(notif => ({ ...notif, status: 'dismissed' as const }))
                    );
                    toast.success('All notifications dismissed');
                  }}
                >
                  Dismiss all
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
