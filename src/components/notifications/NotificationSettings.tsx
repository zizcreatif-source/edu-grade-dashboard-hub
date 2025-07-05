import { useState } from 'react';
import { Bell, Clock, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { settings, updateSettings } = useNotifications();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences de notification ont été mises à jour.",
    });
    onClose();
  };

  const toggleSetting = (key: keyof typeof localSettings) => {
    if (typeof localSettings[key] === 'boolean') {
      setLocalSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const updateQuietHours = (field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setLocalSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test de notification', {
          body: 'Ceci est un test de notification EduGrade',
          icon: '/favicon.ico',
        });
        toast({
          title: "Notification test envoyée",
          description: "Vérifiez si vous l'avez reçue.",
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Test de notification', {
              body: 'Ceci est un test de notification EduGrade',
              icon: '/favicon.ico',
            });
          }
        });
      } else {
        toast({
          title: "Notifications bloquées",
          description: "Les notifications sont bloquées dans votre navigateur.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Types de notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Alertes de progression</Label>
              <p className="text-sm text-muted-foreground">
                Notifications quand un cours atteint 75% de progression
              </p>
            </div>
            <Switch
              checked={localSettings.enableProgressAlerts}
              onCheckedChange={() => toggleSetting('enableProgressAlerts')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Rappels d'évaluations</Label>
              <p className="text-sm text-muted-foreground">
                Rappels avant les évaluations programmées
              </p>
            </div>
            <Switch
              checked={localSettings.enableEvaluationReminders}
              onCheckedChange={() => toggleSetting('enableEvaluationReminders')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notifications système</Label>
              <p className="text-sm text-muted-foreground">
                Messages système et informations importantes
              </p>
            </div>
            <Switch
              checked={localSettings.enableSystemNotifications}
              onCheckedChange={() => toggleSetting('enableSystemNotifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Alertes de sauvegarde</Label>
              <p className="text-sm text-muted-foreground">
                Notifications sur l'état des sauvegardes
              </p>
            </div>
            <Switch
              checked={localSettings.enableBackupAlerts}
              onCheckedChange={() => toggleSetting('enableBackupAlerts')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notifications de mise à jour</Label>
              <p className="text-sm text-muted-foreground">
                Alertes sur les nouvelles versions disponibles
              </p>
            </div>
            <Switch
              checked={localSettings.enableUpdateNotifications}
              onCheckedChange={() => toggleSetting('enableUpdateNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Heures de silence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Activer les heures de silence</Label>
              <p className="text-sm text-muted-foreground">
                Désactiver les notifications pendant certaines heures
              </p>
            </div>
            <Switch
              checked={localSettings.quietHours.enabled}
              onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
            />
          </div>

          {localSettings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Début</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={localSettings.quietHours.start}
                  onChange={(e) => updateQuietHours('start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">Fin</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={localSettings.quietHours.end}
                  onChange={(e) => updateQuietHours('end', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browser Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {Notification.permission === 'granted' ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
            Notifications navigateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            État actuel: {
              Notification.permission === 'granted' ? 'Autorisées' :
              Notification.permission === 'denied' ? 'Bloquées' : 'Non configurées'
            }
          </p>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={testNotification}>
              Tester les notifications
            </Button>
            
            {Notification.permission !== 'granted' && (
              <Button 
                variant="outline"
                onClick={() => Notification.requestPermission()}
              >
                Autoriser les notifications
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSave}>
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
}