import { useState } from 'react';
import { Bell, BellOff, Check, Trash2, Settings, X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { NotificationSettings } from './NotificationSettings';

export function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getCategoryBadge = (category: Notification['category']) => {
    const badges = {
      system: { label: 'Système', variant: 'default' as const },
      progression: { label: 'Progression', variant: 'secondary' as const },
      evaluation: { label: 'Évaluation', variant: 'outline' as const },
      backup: { label: 'Sauvegarde', variant: 'secondary' as const },
      update: { label: 'Mise à jour', variant: 'default' as const },
    };
    
    const badge = badges[category];
    return <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>;
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    return timestamp.toLocaleDateString('fr-FR');
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            {unreadCount > 0 ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 sm:w-96" align="end">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Paramètres de notification</DialogTitle>
                      </DialogHeader>
                      <NotificationSettings onClose={() => setShowSettings(false)} />
                    </DialogContent>
                  </Dialog>
                  
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {unreadCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{unreadCount} nouvelle{unreadCount > 1 ? 's' : ''} notification{unreadCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <>
                  <ScrollArea className="h-96">
                    <div className="space-y-1 p-4">
                      {notifications.map((notification, index) => (
                        <div key={notification.id}>
                          <div 
                            className={`p-3 rounded-lg border transition-colors ${
                              notification.read 
                                ? 'bg-muted/20 border-muted' 
                                : 'bg-background border-border shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : ''}`}>
                                    {notification.title}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1"
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getCategoryBadge(notification.category)}
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(notification.timestamp)}
                                    </span>
                                  </div>
                                  
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto p-1 text-xs"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      Marquer comme lu
                                    </Button>
                                  )}
                                </div>
                                
                                {notification.actions && (
                                  <div className="flex gap-2 pt-2">
                                    {notification.actions.map((action, actionIndex) => (
                                      <Button
                                        key={actionIndex}
                                        variant="outline"
                                        size="sm"
                                        onClick={action.action}
                                      >
                                        {action.label}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {index < notifications.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={clearAll}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Tout supprimer
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune notification</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </>
  );
}