import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingChanges: number;
  lastSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  syncData: () => Promise<void>;
  addPendingChange: (change: any) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connexion rétablie",
        description: "Synchronisation des données en cours...",
      });
      if (pendingChanges > 0) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsOfflineMode(true);
      toast({
        title: "Mode hors-ligne activé",
        description: "Vos modifications seront synchronisées à la reconnexion.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingChanges]);

  // Load pending changes from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem('offline_pending_queue');
    const savedLastSync = localStorage.getItem('offline_last_sync');
    
    if (savedQueue) {
      const queue = JSON.parse(savedQueue);
      setPendingQueue(queue);
      setPendingChanges(queue.length);
    }
    
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }
  }, []);

  const enableOfflineMode = () => {
    setIsOfflineMode(true);
    toast({
      title: "Mode hors-ligne activé",
      description: "Vous pouvez continuer à travailler sans connexion.",
    });
  };

  const disableOfflineMode = () => {
    setIsOfflineMode(false);
    if (pendingChanges > 0 && isOnline) {
      syncData();
    }
  };

  const addPendingChange = (change: any) => {
    const newChange = {
      ...change,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };
    
    const updatedQueue = [...pendingQueue, newChange];
    setPendingQueue(updatedQueue);
    setPendingChanges(updatedQueue.length);
    
    // Save to localStorage
    localStorage.setItem('offline_pending_queue', JSON.stringify(updatedQueue));
  };

  const syncData = async (): Promise<void> => {
    if (!isOnline || pendingChanges === 0) return;

    setSyncStatus('syncing');
    
    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process each pending change
      for (const change of pendingQueue) {
        // In a real app, you would send these to your API
        console.log('Syncing change:', change);
      }
      
      // Clear pending changes
      setPendingQueue([]);
      setPendingChanges(0);
      setLastSync(new Date());
      setSyncStatus('success');
      
      // Save sync status
      localStorage.removeItem('offline_pending_queue');
      localStorage.setItem('offline_last_sync', new Date().toISOString());
      
      toast({
        title: "Synchronisation réussie",
        description: `${pendingQueue.length} modification(s) synchronisée(s).`,
      });
      
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les données. Nouvelle tentative plus tard.",
        variant: "destructive",
      });
    }
  };

  const value = {
    isOnline,
    isOfflineMode,
    pendingChanges,
    lastSync,
    syncStatus,
    enableOfflineMode,
    disableOfflineMode,
    syncData,
    addPendingChange,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};