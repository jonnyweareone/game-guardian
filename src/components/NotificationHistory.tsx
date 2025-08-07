import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Eye,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  child_id?: string;
  child_name?: string;
  notification_type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  action_required: boolean;
  created_at: string;
  related_conversation_id?: string;
  related_alert_id?: string;
}

interface NotificationHistoryProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onViewConversation?: (conversationId: string) => void;
}

const getNotificationIcon = (type: string, priority: string) => {
  switch (type) {
    case 'alert':
      return priority === 'critical' ? 
        <AlertTriangle className="h-4 w-4 text-critical" /> :
        <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'insight':
      return <TrendingUp className="h-4 w-4 text-primary" />;
    case 'summary':
      return <Info className="h-4 w-4 text-primary" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'critical';
    case 'high': return 'warning';
    case 'normal': return 'primary';
    case 'low': return 'muted';
    default: return 'muted';
  }
};

const NotificationHistory = ({ 
  notifications, 
  onMarkAsRead, 
  onViewConversation 
}: NotificationHistoryProps) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.is_read;
      case 'critical': return notif.priority === 'critical';
      default: return true;
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.is_read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification History
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated on your children's gaming activity and safety alerts
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            {criticalCount > 0 && (
              <Button
                variant={filter === 'critical' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFilter('critical')}
              >
                Critical ({criticalCount})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "No notifications match your current filter."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className={`p-4 rounded-lg border ${
                    !notification.is_read ? 'bg-muted/30 border-primary/20' : 'bg-card'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.notification_type, notification.priority)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className={`font-medium text-sm ${
                            !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant={getPriorityColor(notification.priority) === 'critical' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        {notification.child_name && (
                          <div className="flex items-center gap-1 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.child_name}
                            </Badge>
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </div>
                          
                          <div className="flex gap-2">
                            {notification.related_conversation_id && onViewConversation && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewConversation(notification.related_conversation_id!)}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            )}
                            
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkAsRead(notification.id)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            
                            {notification.is_read && (
                              <div className="flex items-center gap-1 text-xs text-safe">
                                <CheckCircle className="h-3 w-3" />
                                Read
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < filteredNotifications.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationHistory;