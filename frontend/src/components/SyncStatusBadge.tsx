'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getOfflineNarratives, syncOfflineQueue } from '../lib/offlineStorage';
import { LanguageCode, translations } from '../lib/translations';

interface Props {
  currentLang: LanguageCode;
  onSyncComplete?: () => void;
}

export const SyncStatusBadge: React.FC<Props> = ({ currentLang, onSyncComplete }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const t = translations[currentLang];

  const checkQueue = async () => {
    try {
      const items = await getOfflineNarratives();
      setQueueCount(items.length);
    } catch {
      setQueueCount(0);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncOfflineQueue();
      await checkQueue();
      if (onSyncComplete) onSyncComplete();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      handleManualSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    checkQueue();

    const interval = setInterval(checkQueue, 5000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-medium border ${
          isOnline
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.statusOnline}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.statusOffline}</span>
          </>
        )}
      </div>

      {queueCount > 0 && (
        <button
          type="button"
          onClick={handleManualSync}
          disabled={!isOnline || isSyncing}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-earth-50 text-earth-800 border border-earth-200 hover:bg-earth-100 transition-colors"
          title={`${queueCount} items in offline queue. Click to synchronize.`}
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{queueCount} {t.queueCount}</span>
        </button>
      )}
    </div>
  );
};

