import { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOffline } from '@/contexts/OfflineContext';

export function SyncStatus() {
  const { 
    isOnline, 
    isOfflineMode, 
    pendingChanges, 
    lastSync, 
    syncStatus, 
    syncData, 
    enableOfflineMode, 
    disableOfflineMode 
  } = useOffline();

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    if (!isOnline) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Hors ligne
        </Badge>
      );
    }
    
    if (isOfflineMode) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CloudOff className="h-3 w-3" />
          Mode hors ligne
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Wifi className="h-3 w-3" />
        En ligne
      </Badge>
    );
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Jamais synchronisé';
    
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    
    return lastSync.toLocaleDateString('fr-FR');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {pendingChanges > 0 && (
            <Badge variant="secondary" className="ml-1">
              {pendingChanges}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">État de synchronisation</h4>
              {getStatusBadge()}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Statut de connexion</span>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Connecté</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Déconnecté</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dernière synchronisation</span>
                <div className="flex items-center gap-2">
                  {getSyncIcon()}
                  <span>{formatLastSync()}</span>
                </div>
              </div>
              
              {pendingChanges > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Modifications en attente</span>
                  <Badge variant="outline">{pendingChanges}</Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mode de travail</span>
                <span>{isOfflineMode ? 'Hors ligne' : 'En ligne'}</span>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2 border-t">
              {isOnline && pendingChanges > 0 && (
                <Button 
                  size="sm" 
                  onClick={syncData}
                  disabled={syncStatus === 'syncing'}
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  {syncStatus === 'syncing' ? 'Synchronisation...' : 'Synchroniser'}
                </Button>
              )}
              
              {isOnline && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={isOfflineMode ? disableOfflineMode : enableOfflineMode}
                  className="flex-1"
                >
                  <CloudOff className="h-4 w-4 mr-2" />
                  {isOfflineMode ? 'Mode en ligne' : 'Mode hors ligne'}
                </Button>
              )}
            </div>
            
            {syncStatus === 'error' && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                Erreur de synchronisation. Vérifiez votre connexion.
              </div>
            )}
            
            {!isOnline && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                Mode hors ligne activé. Vos modifications seront sauvegardées localement.
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}